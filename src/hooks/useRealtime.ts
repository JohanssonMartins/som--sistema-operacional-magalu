import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3333';
const SOCKET_URL = rawSocketUrl;

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

    const onEvent = (event: string, callback: (data: any) => void) => {
        useEffect(() => {
            const socket = socketRef.current;
            if (!socket) return;

            socket.on(event, callback);

            return () => {
                socket.off(event, callback);
            };
        }, [event, callback]);
    };

    return {
        onEvent,
        isConnected: socketRef.current?.connected || false,
        socketId: socketRef.current?.id
    };
};
