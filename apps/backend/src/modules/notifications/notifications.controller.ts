import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsGateway } from './notifications.gateway';

@ApiTags('Notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly gateway: NotificationsGateway) {}

  /**
   * GET /api/notifications/status — ile ekranów (/display) jest połączonych
   */
  @Get('status')
  @ApiOperation({ summary: 'Status połączonych ekranów' })
  status(): { displays: number } {
    return { displays: this.gateway.getDisplayCount() };
  }
}
