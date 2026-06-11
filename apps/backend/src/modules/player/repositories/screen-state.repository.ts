import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ScreenState, DEFAULT_SCREEN_STATE } from '../../../types/player';
import { NotificationsGateway } from '../../notifications/notifications.gateway';
import { getDataPath } from '../../../common/paths';

/**
 * Repository for managing screen state.
 * Persists state to disk (debounced) so a backend restart mid-Mass
 * restores the current scenario/position instead of going black.
 * Automatically notifies clients when state changes.
 */
@Injectable()
export class ScreenStateRepository implements OnModuleInit {
  private readonly logger = new Logger(ScreenStateRepository.name);
  private readonly stateDir: string;
  private readonly statePath: string;
  private state: ScreenState = DEFAULT_SCREEN_STATE;
  private saveTimer: NodeJS.Timeout | null = null;
  private readonly saveDebounceMs = 1000;

  constructor(private readonly notificationsGateway: NotificationsGateway) {
    this.stateDir = getDataPath('settings');
    this.statePath = path.resolve(this.stateDir, 'screen-state.json');
  }

  /**
   * Restore persisted state on startup
   */
  async onModuleInit(): Promise<void> {
    await this.load();
  }

  /**
   * Get current screen state
   */
  get(): ScreenState {
    return this.state;
  }

  /**
   * Update screen state and notify clients
   */
  set(newState: ScreenState): ScreenState {
    this.state = newState;
    this.notify();
    this.scheduleSave();
    return this.state;
  }

  /**
   * Update screen state partially (for single/scenario modes)
   */
  update(updater: (current: ScreenState) => ScreenState): ScreenState {
    this.state = updater(this.state);
    this.notify();
    this.scheduleSave();
    return this.state;
  }

  /**
   * Load persisted state from file (fallback to default on any error)
   */
  private async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.statePath, 'utf-8');
      this.state = JSON.parse(content) as ScreenState;
      this.logger.log('Restored screen state from disk');
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.error('Failed to load screen state, using default', err);
      }
      this.state = DEFAULT_SCREEN_STATE;
    }
  }

  /**
   * Debounced persist to avoid hammering the SD card on rapid navigation
   */
  private scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.save();
    }, this.saveDebounceMs);
  }

  private async save(): Promise<void> {
    try {
      await fs.mkdir(this.stateDir, { recursive: true });
      await fs.writeFile(
        this.statePath,
        JSON.stringify(this.state, null, 2),
        'utf-8',
      );
    } catch (err) {
      this.logger.error('Failed to save screen state', err);
    }
  }

  /**
   * Notify all clients about screen state change
   */
  private notify(): void {
    this.notificationsGateway.notifyScreenStateChanged();
  }
}
