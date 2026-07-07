import { Server } from 'socket.io';

/** @type {Server | null} */
let io = null;

/**
 * Initialize Socket.io server with event handlers.
 * @param {import('http').Server} httpServer - The HTTP server instance
 * @returns {Server} The Socket.io server instance
 */
function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    /**
     * Join a room for a specific patient.
     * All caregivers and the patient share this room for real-time updates.
     */
    socket.on('joinRoom', (patientId) => {
      if (patientId) {
        socket.join(patientId.toString());
        console.log(`Socket ${socket.id} joined room: ${patientId}`);
      }
    });

    /**
     * Handle incoming messages — broadcast to the patient's room.
     */
    socket.on('sendMessage', (data) => {
      if (data && data.patientId) {
        socket.to(data.patientId.toString()).emit('newMessage', data);
      }
    });

    /**
     * Handle typing indicator — broadcast to the patient's room.
     */
    socket.on('typing', (data) => {
      if (data && data.patientId) {
        socket.to(data.patientId.toString()).emit('userTyping', {
          userId: data.userId,
          userName: data.userName,
          isTyping: data.isTyping,
        });
      }
    });

    /**
     * Handle disconnection — cleanup.
     */
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} — ${reason}`);
    });
  });

  console.log('Socket.io initialized');
  return io;
}

/**
 * Get the Socket.io server instance.
 * @returns {Server | null}
 */
function getIO() {
  return io;
}

export { initializeSocket, getIO };
