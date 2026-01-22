import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { DisplayStateService } from './display-state.service';
import { SettingsRepository } from './repositories/settings.repository';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SettingsController],
  providers: [
    SettingsRepository,
    SettingsService,
    DisplayStateService,
  ],
  exports: [SettingsService, DisplayStateService],
})
export class SettingsModule {}
