import { IsString, IsBoolean, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO dla kroku scenariusza
 * Każdy krok powinien mieć dokładnie jedno pole ustawione
 */
export class ScenarioStepDto {
  @ApiProperty({
    description: 'Text reference (id or category:slug)',
    example: 'pieśń:barka',
    required: false,
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Image path relative to media folder',
    example: 'ogłoszenia/logo-parafii.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Video path relative to media folder',
    example: 'ogłoszenia/wideo.mp4',
    required: false,
  })
  @IsString()
  @IsOptional()
  video?: string;

  @ApiProperty({
    description: 'Audio path relative to media folder',
    example: 'muzyka/intro.mp3',
    required: false,
  })
  @IsString()
  @IsOptional()
  audio?: string;

  @ApiProperty({
    description: 'Section heading text',
    example: 'Pieśni',
    required: false,
  })
  @IsString()
  @IsOptional()
  heading?: string;

  @ApiProperty({
    description: 'Blank slide marker',
    example: true,
    required: false,
  })
  @IsBoolean()
  @ValidateIf((o) => o.blank !== undefined)
  blank?: true;
}

