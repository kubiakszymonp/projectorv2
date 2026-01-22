import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  ProjectorSettings,
  DEFAULT_SETTINGS,
  DisplaySettings,
  WifiSettings,
} from '../../types/settings';
import {
  UpdateSettingsDto,
  UpdateDisplaySettingsDto,
  UpdateWifiSettingsDto,
} from '../../types/settings.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

/**
 * Service responsible for managing projector settings.
 * Settings are persisted in YAML file at /data/settings/config.yaml
 * 
 * SRP: Only handles settings persistence, not display state.
 */
@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly settingsDir: string;
  private readonly settingsPath: string;
  private settings: ProjectorSettings;

  constructor(
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    const projectRoot = path.resolve(process.cwd(), '..', '..');
    this.settingsDir = path.resolve(projectRoot, 'data', 'settings');
    this.settingsPath = path.resolve(this.settingsDir, 'config.yaml');
    this.settings = structuredClone(DEFAULT_SETTINGS);
  }

  /**
   * Initialize settings on module start
   */
  async onModuleInit(): Promise<void> {
    await this.loadSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): ProjectorSettings {
    return structuredClone(this.settings);
  }

  /**
   * Update settings (partial update)
   */
  async updateSettings(dto: UpdateSettingsDto): Promise<ProjectorSettings> {
    // Deep merge display settings
    if (dto.display) {
      this.settings.display = this.mergeDisplaySettings(
        this.settings.display,
        dto.display,
      );
    }

    // Merge wifi settings
    if (dto.wifi) {
      this.settings.wifi = this.mergeWifiSettings(
        this.settings.wifi,
        dto.wifi,
      );
    }

    await this.saveSettings();
    
    // Notify all clients about settings change
    this.notificationsGateway.notifySettingsChanged();
    
    return this.getSettings();
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<ProjectorSettings> {
    this.settings = structuredClone(DEFAULT_SETTINGS);
    await this.saveSettings();
    
    // Notify all clients about settings change
    this.notificationsGateway.notifySettingsChanged();
    
    return this.getSettings();
  }

  /**
   * Load settings from YAML file
   */
  private async loadSettings(): Promise<void> {
    try {
      const content = await fs.readFile(this.settingsPath, 'utf-8');
      const loaded = yaml.load(content) as Partial<ProjectorSettings>;
      
      // Merge with defaults to ensure all fields exist
      this.settings = this.mergeWithDefaults(loaded);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist - create with defaults
        await this.saveSettings();
      } else {
        // Other error - log and use defaults
        console.error('Failed to load settings, using defaults:', err);
      }
    }
  }

  /**
   * Save settings to YAML file
   */
  private async saveSettings(): Promise<void> {
    try {
      await fs.mkdir(this.settingsDir, { recursive: true });
      const content = yaml.dump(this.settings, { indent: 2 });
      await fs.writeFile(this.settingsPath, content, 'utf-8');
    } catch (err) {
      console.error('Failed to save settings:', err);
      throw err;
    }
  }

  /**
   * Merge loaded settings with defaults
   */
  private mergeWithDefaults(loaded: Partial<ProjectorSettings>): ProjectorSettings {
    return {
      display: {
        ...DEFAULT_SETTINGS.display,
        ...loaded?.display,
        padding: {
          ...DEFAULT_SETTINGS.display.padding,
          ...loaded?.display?.padding,
        },
      },
      wifi: {
        ...DEFAULT_SETTINGS.wifi,
        ...loaded?.wifi,
      },
    };
  }

  /**
   * Merge display settings (partial update)
   */
  private mergeDisplaySettings(
    current: DisplaySettings,
    update: UpdateDisplaySettingsDto,
  ): DisplaySettings {
    return {
      fontSize: update.fontSize ?? current.fontSize,
      fontFamily: update.fontFamily ?? current.fontFamily,
      lineHeight: update.lineHeight ?? current.lineHeight,
      letterSpacing: update.letterSpacing ?? current.letterSpacing,
      textAlign: update.textAlign ?? current.textAlign,
      backgroundColor: update.backgroundColor ?? current.backgroundColor,
      textColor: update.textColor ?? current.textColor,
      padding: {
        top: update.padding?.top ?? current.padding.top,
        right: update.padding?.right ?? current.padding.right,
        bottom: update.padding?.bottom ?? current.padding.bottom,
        left: update.padding?.left ?? current.padding.left,
      },
    };
  }

  /**
   * Merge wifi settings (partial update)
   */
  private mergeWifiSettings(
    current: WifiSettings,
    update: UpdateWifiSettingsDto,
  ): WifiSettings {
    return {
      ssid: update.ssid ?? current.ssid,
      password: update.password ?? current.password,
    };
  }
}

