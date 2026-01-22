import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProjectorSettings } from '../../types/settings';
import { UpdateSettingsDto } from '../../types/settings.dto';
import { SettingsRepository } from './repositories/settings.repository';

/**
 * Service responsible for managing projector settings.
 * Delegates persistence to SettingsRepository.
 */
@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly settingsRepo: SettingsRepository) {}

  /**
   * Initialize settings on module start
   */
  async onModuleInit(): Promise<void> {
    await this.settingsRepo.load();
  }

  /**
   * Get current settings
   */
  getSettings(): ProjectorSettings {
    return this.settingsRepo.get();
  }

  /**
   * Update settings (partial update)
   */
  async updateSettings(dto: UpdateSettingsDto): Promise<ProjectorSettings> {
    return this.settingsRepo.update(dto);
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<ProjectorSettings> {
    return this.settingsRepo.reset();
  }
}

