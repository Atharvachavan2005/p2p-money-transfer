import { Router, type Request, type Response } from 'express';
import { authenticateJWT, type AuthRequest } from '../middleware/auth.js';
import { executeTransfer } from '../services/transferService.js';
import { prisma } from '../utils/prisma.js';

const router = Router();

router.post('/transfer', authenticateJWT, async (req: AuthRequest, res: Response) => {
    const { receiverId, amount } = req.body;
    const senderId = req.user!.id;
    const io = req.app.get('io');

    try {
        // 1. EXECUTE ATOMIC TRANSACTION (Logic from Phase 3)
        const transaction = await executeTransfer(senderId, receiverId, amount);

        // 2. ASYNCHRONOUS AUDIT LOGGING (Don't 'await' it to keep API fast)
        prisma.auditLog.create({
            data: {
                transactionId: transaction.id,
                senderId: senderId,
                receiverId: receiverId,
                amount: amount,
                status: 'SUCCESS',
            }
        }).catch((err: Error) => console.error("Audit log failed:", err));

        // 3. REAL-TIME UPDATES (Emit to both sender and receiver)
        io.to(senderId).emit('balance_update', { message: 'Money sent successfully' });
        io.to(receiverId).emit('balance_update', { message: 'You received money!' });

        res.status(200).json({ success: true, transaction });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
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