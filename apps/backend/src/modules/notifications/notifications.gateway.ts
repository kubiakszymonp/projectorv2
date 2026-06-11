import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// Prod serves the socket same-origin via nginx → no CORS needed.
// Dev (Vite on a different port) needs permissive CORS.
const isProd = process.env.NODE_ENV === 'production';

/**
 * WebSocket Gateway for real-time notifications
 * Emits events when settings or screen state changes
 */
@WebSocketGateway({
  cors: isProd ? false : { origin: true, methods: ['GET', 'POST'] },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor() {
    // Log when gateway is initialized
    this.logger.log('NotificationsGateway initialized');
  }

  afterInit() {
    this.logger.log('Socket.IO server initialized on namespace /notifications');
  }

  // Per-connection/emit logs are debug-only to spare the SD card from
  // constant writes (each connect + every emit otherwise hits the log).
  handleConnection(client: Socket) {
    this.logger.debug(
      `Client connected: ${client.id} (${client.conn.transport.name})`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit event when settings are updated
   */
  notifySettingsChanged() {
    this.logger.debug('Emitting settings:changed event');
    this.server.emit('settings:changed');
  }

  /**
   * Emit event when screen state is updated
   */
  notifyScreenStateChanged() {
    this.logger.debug('Emitting screen:changed event');
    this.server.emit('screen:changed');
  }
}

