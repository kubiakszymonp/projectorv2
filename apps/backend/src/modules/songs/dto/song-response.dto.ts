import { ApiProperty } from '@nestjs/swagger';

export class SongMetaDto {
  @ApiProperty({
    description: 'Schema version',
    example: 1,
  })
  schemaVersion: 1;

  @ApiProperty({
    description: 'Unique song identifier (ULID)',
    example: '01HXZ3R8E7Q2V4VJ6T9G2J8N1P',
  })
  id: string;

  @ApiProperty({
    description: 'Song title',
    example: 'Barka',
  })
  title: string;

  @ApiProperty({
    description: 'Song description',
    example: 'Pieśń maryjna i pielgrzymkowa',
  })
  description: string;

  @ApiProperty({
    description: 'Song categories',
    example: ['maryjne', 'pielgrzymkowe'],
    type: [String],
  })
  categories: string[];
}

export class SongDocDto {
  @ApiProperty({
    description: 'Song metadata',
    type: SongMetaDto,
  })
  meta: SongMetaDto;

  @ApiProperty({
    description: 'Raw song content (full text)',
    example: 'Refren:\nPanie mój, Ty wiesz dokąd zmierzam\n\nZwrotka 1:\nW deszczu dni...',
  })
  contentRaw: string;

  @ApiProperty({
    description: 'Song slides (content split by blank lines)',
    example: [
      'Refren:\nPanie mój, Ty wiesz dokąd zmierzam',
      'Zwrotka 1:\nW deszczu dni...',
    ],
    type: [String],
  })
  slides: string[];
}

