import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TextsModule } from './modules/texts/texts.module';
import { FilesModule } from './modules/files/files.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ScenariosModule } from './modules/scenarios/scenarios.module';
import { PlayerModule } from './modules/player/player.module';

@Module({
  imports: [TextsModule, FilesModule, SettingsModule, ScenariosModule, PlayerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
