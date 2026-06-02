import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io, { type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getSocketToken } from '../api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  // 1. Inisialisasi koneksi socket tunggal secara persisten
  useEffect(() => {
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (baseUrl === '/') {
      baseUrl = window.location.origin;
    }
    const socketInstance = io(baseUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', () => {
      setIsConnected(false);
    });

    socketInstance.on('online-count', (count: number) => {
      setOnlineCount(count);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // 2. Kirim ulang autentikasi token tiap kali user login ATAU socket melakukan reconnect otomatis
  useEffect(() => {
    if (user && isConnected && socketRef.current) {
      getSocketToken()
        .then(res => {
          if (socketRef.current?.connected) {
            socketRef.current.emit('authenticate', res.data.token);
          }
        })
        .catch(err => console.error('Gagal mengambil token websocket:', err));
    }
  }, [user, isConnected]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, onlineCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
