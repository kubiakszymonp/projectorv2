import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTextDto {
  @ApiProperty({
    description: 'Domain (folder) to move text to',
    example: 'songs',
    required: false,
  })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiProperty({
    description: 'Text title',
    example: 'Barka',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Text description',
    example: 'Pieśń maryjna i pielgrzymkowa',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Text categories',
    example: ['maryjne', 'pielgrzymkowe'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    description: 'Text content (slides separated by blank lines)',
    example: 'Refren:\nPanie mój, Ty wiesz dokąd zmierzam\n\nZwrotka 1:\nW deszczu dni...',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}

