import {
  Controller,
  Get,
  Patch,
  Put,
  Delete,
  Body,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { DisplayStateService } from './display-state.service';
import {
  UpdateSettingsDto,
  UpdateDisplayStateDto,
} from '../../types/settings.dto';
import {
  SettingsResponse,
  DisplayStateResponse,
  ProjectorSettings,
  DisplayState,
} from '../../types/settings';

@ApiTags('Settings')
@Controller('api/settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly displayStateService: DisplayStateService,
  ) {}

  // ========== SETTINGS ENDPOINTS ==========

  /**
   * GET /api/settings
   * Pobiera aktualne ustawienia projektora
   */
  @Get()
  @ApiOperation({ summary: 'Pobiera ustawienia projektora' })
  @ApiResponse({
    status: 200,
    description: 'Aktualne ustawienia',
  })
  getSettings(): SettingsResponse {
    return {
      settings: this.settingsService.getSettings(),
    };
  }

  /**
   * PATCH /api/settings
   * Aktualizuje ustawienia projektora (częściowa aktualizacja)
   */
  @Patch()
  @ApiOperation({ summary: 'Aktualizuje ustawienia projektora' })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Zaktualizowane ustawienia',
  })
  async updateSettings(
    @Body() dto: UpdateSettingsDto,
  ): Promise<SettingsResponse> {
    const settings = await this.settingsService.updateSettings(dto);
    return { settings };
  }

  /**
   * DELETE /api/settings
   * Resetuje ustawienia do wartości domyślnych
   */
  @Delete()
  @ApiOperation({ summary: 'Resetuje ustawienia do domyślnych' })
  @ApiResponse({
    status: 200,
    description: 'Zresetowane ustawienia',
  })
  async resetSettings(): Promise<SettingsResponse> {
    const settings = await this.settingsService.resetSettings();
    return { settings };
  }

  // ========== DISPLAY STATE ENDPOINTS ==========

  /**
   * GET /api/settings/display
   * Pobiera aktualny stan wyświetlania
   */
  @Get('display')
  @ApiOperation({ summary: 'Pobiera aktualny stan wyświetlania' })
  @ApiResponse({
    status: 200,
    description: 'Aktualny stan wyświetlania',
  })
  getDisplayState(): DisplayStateResponse {
    return {
      state: this.displayStateService.getState(),
    };
  }

  /**
   * PUT /api/settings/display
   * Ustawia co ma być wyświetlane na projektorze
   */
  @Put('display')
  @ApiOperation({ summary: 'Ustawia zawartość wyświetlaną na projektorze' })
  @ApiBody({ type: UpdateDisplayStateDto })
  @ApiResponse({
    status: 200,
    description: 'Zaktualizowany stan wyświetlania',
  })
  updateDisplayState(
    @Body() dto: UpdateDisplayStateDto,
  ): DisplayStateResponse {
    this.validateDisplayDto(dto);
    const state = this.displayStateService.updateState(dto);
    return { state };
  }

  /**
   * DELETE /api/settings/display
   * Czyści ekran (czarny ekran)
   */
  @Delete('display')
  @ApiOperation({ summary: 'Czyści ekran (czarny ekran)' })
  @ApiResponse({
    status: 200,
    description: 'Ekran wyczyszczony',
  })
  clearDisplay(): DisplayStateResponse {
    const state = this.displayStateService.clearDisplay();
    return { state };
  }

  /**
   * Validates display DTO based on content type
   */
  private validateDisplayDto(dto: UpdateDisplayStateDto): void {
    switch (dto.type) {
      case 'blank':
        // No additional fields required
        break;

      case 'song':
        if (!dto.songId || dto.verseIndex === undefined || !dto.text) {
          throw new BadRequestException(
            'Song display requires: songId, verseIndex, text',
          );
        }
        break;

      case 'image':
      case 'video':
        if (!dto.mediaPath) {
          throw new BadRequestException(
            `${dto.type} display requires: mediaPath`,
          );
        }
        break;

      case 'announcement':
        if (!dto.text) {
          throw new BadRequestException(
            'Announcement display requires: text',
          );
        }
        break;

      default:
        throw new BadRequestException(`Unknown display type: ${dto.type}`);
    }
  }
}

