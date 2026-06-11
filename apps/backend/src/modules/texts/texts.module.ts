import { Module } from '@nestjs/common';
import { TextsController } from './texts.controller';
import { TextsService } from './texts.service';
import { TextFormatterService } from './text-formatter.service';
import { TextLoader } from './text-loader';
import { TextCreator } from './text-creator';
import { TextUpdater } from './text-updater';

@Module({
  controllers: [TextsController],
  providers: [
    TextsService,
    TextFormatterService,
    TextLoader,
    TextCreator,
    TextUpdater,
  ],
  exports: [TextsService, TextFormatterService],
})
export class TextsModule {}






