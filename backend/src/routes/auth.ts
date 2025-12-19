import { Router, type Request, type Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';

const router = Router();

// 1. REGISTER: Create a user with a default balance
router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash: hashedPassword,
                balance: 1000.00 // Default starting money for the assignment
            }
        });

        res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Username already exists or invalid data" });
    }
});

// 2. LOGIN: Verify credentials and return a JWT
router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Sign the token with user ID and username
    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
    );

    res.json({ 
        token, 
        user: { id: user.id, username: user.username, balance: user.balance } 
    });
});

export default router;