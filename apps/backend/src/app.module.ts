import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongsModule } from './modules/songs/songs.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [SongsModule, MediaModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
