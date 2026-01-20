// ========== SETTINGS DOMAIN - DTOs ==========

import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsIn, 
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DisplayContentType, TextAlign } from './settings';

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

// ========== DISPLAY STATE DTOs ==========

/**
 * DTO for displaying a text slide (song, reading, etc.)
 * PUT /api/settings/display (type: 'text')
 */
export class DisplayTextDto {
  @IsIn(['text'])
  type: 'text';

  @IsNotEmpty()
  @IsString()
  textId: string;

  @IsNumber()
  @Min(0)
  verseIndex: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  title?: string;
}

/**
 * DTO for displaying media
 * PUT /api/settings/display (type: 'image' | 'video')
 */
export class DisplayMediaDto {
  @IsIn(['image', 'video'])
  type: 'image' | 'video';

  @IsNotEmpty()
  @IsString()
  mediaPath: string;
}

/**
 * DTO for displaying an announcement
 * PUT /api/settings/display (type: 'announcement')
 */
export class DisplayAnnouncementDto {
  @IsIn(['announcement'])
  type: 'announcement';

  @IsNotEmpty()
  @IsString()
  text: string;
}

/**
 * DTO for blank screen
 * PUT /api/settings/display (type: 'blank')
 */
export class DisplayBlankDto {
  @IsIn(['blank'])
  type: 'blank';
}

/**
 * Union DTO for updating display state
 * PUT /api/settings/display
 * 
 * Note: In controller we manually validate based on type
 */
export class UpdateDisplayStateDto {
  @IsIn(['blank', 'text', 'image', 'video', 'announcement'])
  type: DisplayContentType;

  // Text fields (song, reading, etc.)
  @IsOptional()
  @IsString()
  textId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  verseIndex?: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  title?: string;

  // Media fields
  @IsOptional()
  @IsString()
  mediaPath?: string;
}

