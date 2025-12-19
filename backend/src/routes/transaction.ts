import { Router } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { executeTransfer } from '../services/transferService';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

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
                logDetails: `Transfer of ${amount} from ${senderId} to ${receiverId} completed.`,
            }
        }).catch(err => console.error("Audit log failed:", err));

        // 3. REAL-TIME UPDATES (Emit to both sender and receiver)
        io.to(senderId).emit('balance_update', { message: 'Money sent successfully' });
        io.to(receiverId).emit('balance_update', { message: 'You received money!' });

        res.status(200).json({ success: true, transaction });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Fetch transaction history for the logged-in user
router.get('/history', authenticateJWT, async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    try {
        const history = await prisma.transaction.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: { select: { username: true } },
                receiver: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch history" });
    }
});

export default router;