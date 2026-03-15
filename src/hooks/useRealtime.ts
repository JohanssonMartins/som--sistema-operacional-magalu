import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3333';

export const useRealtime = () => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Inicializa a conexao
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Socket] Conectado ao servidor:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Desconectado do servidor');
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Erro de conexao:', error);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return {
        socket: socketRef.current,
        isConnected: socketRef.current?.connected || false,
        socketId: socketRef.current?.id
    };
};
