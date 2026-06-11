import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService, HealthStatus } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * GET /api/health — status, uptime, liczba tekstów
   */
  @Get('api/health')
  @ApiOperation({ summary: 'Status systemu (health)' })
  async getHealth(): Promise<HealthStatus> {
    return this.appService.getHealth();
  }
}
