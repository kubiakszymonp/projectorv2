import { ApiProperty } from '@nestjs/swagger';

export class TextMetaDto {
  @ApiProperty({
    description: 'Schema version',
    example: 1,
  })
  schemaVersion: 1;

  @ApiProperty({
    description: 'Unique text identifier (ULID)',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  id: string;

  @ApiProperty({
    description: 'Text title',
    example: 'Barka',
  })
  title: string;

  @ApiProperty({
    description: 'Text description',
    example: 'Pieśń maryjna i pielgrzymkowa',
  })
  description: string;

  @ApiProperty({
    description: 'Text categories',
    example: ['maryjne', 'pielgrzymkowe'],
    type: [String],
  })
  categories: string[];
}

export class TextDocDto {
  @ApiProperty({
    description: 'Text metadata',
    type: TextMetaDto,
  })
  meta: TextMetaDto;

  @ApiProperty({
    description: 'Raw text content (full text)',
    example: 'Refren:\nPanie mój, Ty wiesz dokąd zmierzam\n\nZwrotka 1:\nW deszczu dni...',
  })
  contentRaw: string;

  @ApiProperty({
    description: 'Text slides (content split by blank lines)',
    example: [
      'Refren:\nPanie mój, Ty wiesz dokąd zmierzam',
      'Zwrotka 1:\nW deszczu dni...',
    ],
    type: [String],
  })
  slides: string[];
}

