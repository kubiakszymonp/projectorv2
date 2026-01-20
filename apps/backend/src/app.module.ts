import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongsModule } from './modules/songs/songs.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [SongsModule, MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
