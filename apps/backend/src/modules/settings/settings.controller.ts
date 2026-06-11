import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from '../../types/settings.dto';
import { SettingsResponse } from '../../types/settings';

@ApiTags('Settings')
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/settings
   * Pobiera aktualne ustawienia projektora
   */
  @Get()
  @ApiOperation({ summary: 'Pobiera ustawienia projektora' })
  @ApiResponse({ status: 200, description: 'Aktualne ustawienia' })
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
  @ApiResponse({ status: 200, description: 'Zaktualizowane ustawienia' })
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
  @ApiResponse({ status: 200, description: 'Zresetowane ustawienia' })
  async resetSettings(): Promise<SettingsResponse> {
    const settings = await this.settingsService.resetSettings();
    return { settings };
  }
}
