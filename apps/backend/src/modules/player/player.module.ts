import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { ScenariosModule } from '../scenarios/scenarios.module';
import { TextsModule } from '../texts/texts.module';

@Module({
  imports: [ScenariosModule, TextsModule],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}



