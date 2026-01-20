import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTextDto {
  @ApiProperty({
    description: 'Text title',
    example: 'Barka',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

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

