import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  ProjectorSettings,
  DEFAULT_SETTINGS,
  DisplaySettings,
  WifiSettings,
} from '../../../types/settings';
import {
  UpdateSettingsDto,
  UpdateDisplaySettingsDto,
  UpdateWifiSettingsDto,
} from '../../../types/settings.dto';
import { NotificationsGateway } from '../../notifications/notifications.gateway';

/**
 * Repository for managing settings persistence.
 * Automatically notifies clients when settings change.
 */
@Injectable()
export class SettingsRepository {
  private readonly settingsDir: string;
  private readonly settingsPath: string;
  private settings: ProjectorSettings;

  constructor(private readonly notificationsGateway: NotificationsGateway) {
    const projectRoot = path.resolve(process.cwd(), '..', '..');
    this.settingsDir = path.resolve(projectRoot, 'data', 'settings');
    this.settingsPath = path.resolve(this.settingsDir, 'config.yaml');
    this.settings = structuredClone(DEFAULT_SETTINGS);
  }

  /**
   * Get current settings
   */
  get(): ProjectorSettings {
    return structuredClone(this.settings);
  }

  /**
   * Load settings from file
   */
  async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.settingsPath, 'utf-8');
      const loaded = yaml.load(content) as Partial<ProjectorSettings>;
      this.settings = this.mergeWithDefaults(loaded);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.save();
      } else {
        console.error('Failed to load settings, using defaults:', err);
      }
    }
  }

  /**
   * Save settings to file and notify clients
   */
  async save(): Promise<void> {
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
   * Update settings and notify clients
   */
  async update(dto: UpdateSettingsDto): Promise<ProjectorSettings> {
    if (dto.display) {
      this.settings.display = this.mergeDisplaySettings(
        this.settings.display,
        dto.display,
      );
    }

    if (dto.wifi) {
      this.settings.wifi = this.mergeWifiSettings(
        this.settings.wifi,
        dto.wifi,
      );
    }

    await this.save();
    this.notify();
    return this.get();
  }

  /**
   * Reset settings to defaults and notify clients
   */
  async reset(): Promise<ProjectorSettings> {
    this.settings = structuredClone(DEFAULT_SETTINGS);
    await this.save();
    this.notify();
    return this.get();
  }

  /**
   * Notify all clients about settings change
   */
  private notify(): void {
    this.notificationsGateway.notifySettingsChanged();
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



