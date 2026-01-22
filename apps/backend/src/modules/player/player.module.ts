import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { ScreenStateService } from './services/screen-state.service';
import { ScreenStateRepository } from './repositories/screen-state.repository';
import { ScenariosModule } from '../scenarios/scenarios.module';
import { TextsModule } from '../texts/texts.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ScenariosModule, TextsModule, NotificationsModule],
  controllers: [PlayerController],
  providers: [
    ScreenStateRepository,
    ScreenStateService,
    PlayerService,
  ],
  exports: [PlayerService],
})
export class PlayerModule {}



