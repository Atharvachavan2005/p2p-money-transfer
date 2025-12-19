import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" } // In production, restrict this to your frontend URL
});

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
    console.log(`http://localhost:${PORT}`);
});