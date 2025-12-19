import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include the user object
export interface AuthRequest extends Request {
    user?: { id: string; username: string };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get token from Header: Authorization: Bearer <TOKEN>
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; username: string };
        req.user = decoded; // Attach user data to request
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};