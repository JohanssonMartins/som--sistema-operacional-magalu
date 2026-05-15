import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3333';
const SOCKET_URL = rawSocketUrl;

let globalSocket: Socket | null = null;

export const useRealtime = () => {
    if (!globalSocket) {
        globalSocket = io(SOCKET_URL);
    }

    useEffect(() => {
        const socket = globalSocket!;
        
        const onConnect = () => console.log('[Socket] Conectado ao servidor:', socket.id);
        const onDisconnect = () => console.log('[Socket] Desconectado do servidor');
        const onError = (error: any) => console.error('[Socket] Erro de conexao:', error);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onError);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onError);
        };
    }, []);

    return {
        socket: globalSocket,
        isConnected: globalSocket?.connected || false,
        socketId: globalSocket?.id
    };
};
