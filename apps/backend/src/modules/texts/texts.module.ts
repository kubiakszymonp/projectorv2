import { Module } from '@nestjs/common';
import { TextsController } from './texts.controller';
import { TextsService } from './texts.service';
import { TextFormatterService } from './text-formatter.service';

@Module({
  controllers: [TextsController],
  providers: [TextsService, TextFormatterService],
  exports: [TextsService, TextFormatterService],
})
export class TextsModule {}






