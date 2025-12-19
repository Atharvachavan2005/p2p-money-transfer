import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transaction.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Route definitions
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

export default app;