import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

/**
 * Get or create socket instance
 */
function getSocket(): Socket {
  if (!socketInstance) {
    // In production (Docker), use relative URL so nginx can proxy the request
    // In development, use direct backend URL
    const isDevelopment = import.meta.env.DEV;
    const backendUrl = isDevelopment 
      ? 'http://localhost:10000' 
      : window.location.origin;
    const namespace = '/notifications';
    
    console.debug('[Socket] Creating new socket connection:', {
      backendUrl,
      namespace,
      expectedUrl: `${backendUrl}/socket.io${namespace}`,
      origin: window.location.origin,
      href: window.location.href,
    });
    
    // Socket.IO client automatically handles /socket.io/ prefix
    // Just pass the base URL and namespace
    socketInstance = io(`${backendUrl}${namespace}`, {
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
      timeout: 20000, // 20 seconds timeout
      forceNew: false,
      withCredentials: false,
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.debug('[Socket] ✅ Connected successfully!', {
        id: socketInstance?.id,
        transport: socketInstance?.io.engine?.transport?.name,
      });
    });

    socketInstance.on('disconnect', (reason) => {
      console.debug('[Socket] ❌ Disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] ❌ Connection error:', {
        message: error.message,
        error: error,
      });
    });

    socketInstance.on('error', (error) => {
      console.error('[Socket] ❌ Error:', error);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.debug('[Socket] 🔄 Reconnected after', attemptNumber, 'attempts');
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.debug('[Socket] 🔄 Reconnection attempt', attemptNumber);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('[Socket] ❌ Reconnection error:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('[Socket] ❌ Reconnection failed after all attempts');
    });
  }
  return socketInstance;
}

/**
 * Hook to listen to socket events
 * @param event - Event name to listen to
 * @param callback - Callback function when event is received
 */
export function useSocketEvent(
  event: string,
  callback: () => void,
) {
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = getSocket();

    const handler = () => {
      console.debug(`[Socket] Received event: ${event}`);
      callbackRef.current();
    };

    console.debug(`[Socket] Listening to event: ${event}`);
    socket.on(event, handler);

    return () => {
      console.debug(`[Socket] Removing listener for event: ${event}`);
      socket.off(event, handler);
    };
  }, [event]);
}

/**
 * Cleanup socket connection (for testing or cleanup)
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

