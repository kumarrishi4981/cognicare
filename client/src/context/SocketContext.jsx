import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  const joinRoom = (patientId) => {
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', patientId);
    }
  };

  const leaveRoom = (patientId) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', patientId);
    }
  };

  const sendMessage = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', data);
    }
  };

  const onNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('newMessage', callback);
      return () => socketRef.current?.off('newMessage', callback);
    }
  };

  const emitTyping = (patientId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { patientId, userName: user?.name });
    }
  };

  const onUserTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('userTyping', callback);
      return () => socketRef.current?.off('userTyping', callback);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinRoom,
        leaveRoom,
        sendMessage,
        onNewMessage,
        emitTyping,
        onUserTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
