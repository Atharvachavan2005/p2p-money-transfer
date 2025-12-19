import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import httpServer from './app'; // We will export the server from app.ts now
import { Server } from 'socket.io';

const io = new Server(httpServer, {
    cors: { origin: "*" }
});

// Pass io to app so routes can use it
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// Import your routes here (we will create them next)

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" } // In production, restrict this to your frontend URL
});

app.use(cors());
app.use(express.json());

// Global Socket.io instance for use in routes
app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Users "join" a room named after their UserID to receive private updates
    socket.on('join', (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app, io };