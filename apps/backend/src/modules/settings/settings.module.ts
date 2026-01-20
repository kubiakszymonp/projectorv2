import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { DisplayStateService } from './display-state.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, DisplayStateService],
  exports: [SettingsService, DisplayStateService],
})
export class SettingsModule {}
