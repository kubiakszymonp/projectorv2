import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket Gateway for real-time notifications
 * Emits events when settings or screen state changes
 */
@WebSocketGateway({
  cors: {
    origin: '*', // W produkcji ustaw na konkretne domeny
    methods: ['GET', 'POST'],
  },
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

  afterInit(server: Server) {
    this.logger.log('Socket.IO server initialized on namespace /notifications');
    this.logger.log(`Server ready: ${server ? 'yes' : 'no'}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Transport: ${client.conn.transport.name}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit event when settings are updated
   */
  notifySettingsChanged() {
    this.logger.log('Emitting settings:changed event');
    this.server.emit('settings:changed');
  }

  /**
   * Emit event when screen state is updated
   */
  notifyScreenStateChanged() {
    this.logger.log('Emitting screen:changed event');
    this.server.emit('screen:changed');
  }
}

