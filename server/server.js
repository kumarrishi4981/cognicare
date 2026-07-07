import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';

import { connectDB } from './config/db.js';
import { initializeSocket } from './services/socketService.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import routineRoutes from './routes/routineRoutes.js';
import logRoutes from './routes/logRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import companionRoutes from './routes/companionRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CogniCare API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/files', fileRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize Socket.io
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`\n🧠 CogniCare server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Health:  http://localhost:${PORT}/api/health\n`);
});

export default app;
