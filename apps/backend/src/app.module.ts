import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TextsModule } from './modules/texts/texts.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ScenariosModule } from './modules/scenarios/scenarios.module';

@Module({
  imports: [TextsModule, MediaModule, SettingsModule, ScenariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
