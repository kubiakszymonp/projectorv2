// ========== SETTINGS DOMAIN - DTOs ==========

import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TextAlign } from './settings';

/**
 * DTO for padding update
 */
export class UpdatePaddingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  top?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  right?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bottom?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  left?: number;
}

/**
 * DTO for display settings update
 */
export class UpdateDisplaySettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(8)
  fontSize?: number;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePaddingDto)
  padding?: UpdatePaddingDto;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  lineHeight?: number;

  @IsOptional()
  @IsNumber()
  letterSpacing?: number;

  @IsOptional()
  @IsIn(['left', 'center', 'right'])
  textAlign?: TextAlign;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLinesPerPage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxCharsPerLine?: number;

  @IsOptional()
  @IsIn(['black', 'clock', 'logo'])
  blankScreen?: 'black' | 'clock' | 'logo';

  @IsOptional()
  @IsString()
  blankLogoPath?: string;

  @IsOptional()
  @IsBoolean()
  showPageNumber?: boolean;

  @IsOptional()
  @IsBoolean()
  autoFitText?: boolean;
}

/**
 * DTO for WiFi settings update
 */
export class UpdateWifiSettingsDto {
  @IsOptional()
  @IsString()
  ssid?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

/**
 * DTO for updating projector settings
 * PATCH /api/settings
 */
export class UpdateSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDisplaySettingsDto)
  display?: UpdateDisplaySettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateWifiSettingsDto)
  wifi?: UpdateWifiSettingsDto;
}

