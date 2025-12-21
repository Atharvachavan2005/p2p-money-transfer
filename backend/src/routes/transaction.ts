import { Router, type Request, type Response } from 'express';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';
import { executeTransfer } from '../services/transferService.js';
import { prisma } from '../utils/prisma.js';

const router = Router();

router.post('/transfer', authenticateJWT, async (req: AuthRequest, res: Response) => {
    const { receiverUsername, amount } = req.body;
    const senderId = req.user!.id;
    const io = req.app.get('io');

    // Input validation
    if (!receiverUsername || !amount) {
        return res.status(400).json({ 
            success: false, 
            message: "Receiver username and amount are required" 
        });
    }

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Amount must be a positive number" 
        });
    }

    if (receiverUsername === req.user!.username) {
        return res.status(400).json({ 
            success: false, 
            message: "Cannot transfer money to yourself" 
        });
    }

    try {
        // 1. Look up receiver by username
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername },
            select: { id: true }
        });

        if (!receiver) {
            return res.status(404).json({ 
                success: false, 
                message: "Receiver not found. Please verify the username." 
            });
        }

        const receiverId = receiver.id;

        // 2. EXECUTE ATOMIC TRANSACTION (Logic from Phase 3)
        const transaction = await executeTransfer(senderId, receiverId, amount) as {
            id: string;
            senderId: string;
            receiverId: string;
            amount: number;
            status: string;
            createdAt: Date;
        };

        // 2. ASYNCHRONOUS AUDIT LOGGING (Append-only, immutable)
        // Audit log is separate from transaction - it's append-only
        // We never edit or delete audit logs - they're immutable records
        prisma.auditLog.create({
            data: {
                transactionId: transaction.id,
                senderId: senderId,
                receiverId: receiverId,
                amount: amount,
                status: 'SUCCESS',
            }
        }).catch((err: Error) => console.error("Audit log failed:", err));

        // 3. REAL-TIME UPDATES (Emit to both sender and receiver with updated balances)
        // Note: Socket.IO may not work in serverless environments (e.g., Vercel)
        // Added safety check to prevent errors when io is undefined
        if (io && typeof io.to === 'function') {
            const senderData = await prisma.user.findUnique({ where: { id: senderId } });
            const receiverData = await prisma.user.findUnique({ where: { id: receiverId } });
            
            io.to(senderId).emit('balance_update', { 
                message: 'Money sent successfully',
                amount: -amount,
                newBalance: senderData?.balance || 0
            });
            io.to(receiverId).emit('balance_update', { 
                message: 'You received money!',
                amount: amount,
                newBalance: receiverData?.balance || 0
            });
        }

        res.status(200).json({ success: true, transaction });
    } catch (error: any) {
        // All errors from executeTransfer will be caught here
        // The transaction automatically rolls back, so balance never changes
        const errorMessage = error.message || "Transfer failed";
        
        // Provide specific error messages
        if (errorMessage.includes("Insufficient funds")) {
            return res.status(400).json({ 
                success: false, 
                message: "Transaction failed: Insufficient funds" 
            });
        }
        
        if (errorMessage.includes("Receiver not found") || errorMessage.includes("not found")) {
            return res.status(404).json({ 
                success: false, 
                message: "Transfer failed: Receiver username not found. Please verify the username." 
            });
        }

        // Generic error response
        res.status(400).json({ 
            success: false, 
            message: `Transaction failed: ${errorMessage}` 
        });
    }
});

// Fetch current user balance
router.get('/balance', authenticateJWT, async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch balance" });
    }
});

// Fetch transaction history (Audit Log) for the logged-in user
router.get('/history', authenticateJWT, async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    try {
        const auditLogs = await prisma.auditLog.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { timestamp: 'desc' }
        });
        res.json(auditLogs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch transaction history" });
    }
});

export default router;