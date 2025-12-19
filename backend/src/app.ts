import express from 'express';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transaction';

const app = express();

app.use(express.json());

// API Route definitions
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Helper for transaction history (Requirement: Read API)
app.get('/api/history', async (req, res) => {
    // Note: In production, wrap this with authenticateJWT
    const history = await prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json(history);
});

export default app;