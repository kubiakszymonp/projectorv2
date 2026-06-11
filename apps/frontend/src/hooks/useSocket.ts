import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

// Optional role this client announces to the server on (re)connect
let desiredRole: string | null = null;

// Connection status tracking
let isConnected = false;
const statusListeners = new Set<(connected: boolean) => void>();
// Fires on every (re)connection so consumers can refetch state that may have
// changed while the socket was down.
const reconnectListeners = new Set<() => void>();

function setConnected(value: boolean) {
  if (isConnected === value) return;
  isConnected = value;
  statusListeners.forEach((cb) => cb(value));
}

function notifyReconnect() {
  reconnectListeners.forEach((cb) => cb());
}

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
      reconnectionDelayMax: 5000, // cap backoff so a TV recovers quickly
      reconnectionAttempts: Infinity, // never give up — church TV must self-heal
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
      setConnected(true);
      // Re-announce our role after every (re)connect
      if (desiredRole) {
        socketInstance?.emit('register', { role: desiredRole });
      }
      // State may have changed while we were offline (initial connect too) —
      // force a refetch.
      notifyReconnect();
    });

    socketInstance.on('disconnect', (reason) => {
      console.debug('[Socket] ❌ Disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] ❌ Connection error:', {
        message: error.message,
        error: error,
      });
      setConnected(false);
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
 * Hook that runs a callback every time the socket (re)connects.
 * Use to refetch server state that may have drifted while offline.
 */
export function useSocketReconnect(callback: () => void) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    getSocket(); // ensure socket exists
    const handler = () => callbackRef.current();
    reconnectListeners.add(handler);
    return () => {
      reconnectListeners.delete(handler);
    };
  }, []);
}

/**
 * Announce a role (e.g. 'display') to the server for the lifetime of the page.
 * Re-emitted automatically on every reconnect.
 */
export function useRegisterSocketRole(role: string) {
  useEffect(() => {
    desiredRole = role;
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('register', { role });
    }
    return () => {
      desiredRole = null;
    };
  }, [role]);
}

/**
 * Hook returning the current socket connection status (true = connected).
 * For a discreet "no connection" indicator in the control panel.
 */
export function useSocketStatus(): boolean {
  const [connected, setConnectedState] = useState(isConnected);

  useEffect(() => {
    getSocket(); // ensure socket exists
    setConnectedState(isConnected);
    const handler = (value: boolean) => setConnectedState(value);
    statusListeners.add(handler);
    return () => {
      statusListeners.delete(handler);
    };
  }, []);

  return connected;
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
