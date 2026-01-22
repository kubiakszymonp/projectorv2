import { Injectable } from '@nestjs/common';
import { ScreenState, DEFAULT_SCREEN_STATE } from '../../../types/player';
import { NotificationsGateway } from '../../notifications/notifications.gateway';

/**
 * Repository for managing screen state.
 * Automatically notifies clients when state changes.
 */
@Injectable()
export class ScreenStateRepository {
  private state: ScreenState = DEFAULT_SCREEN_STATE;

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

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
    return this.state;
  }

  /**
   * Update screen state partially (for single/scenario modes)
   */
  update(updater: (current: ScreenState) => ScreenState): ScreenState {
    this.state = updater(this.state);
    this.notify();
    return this.state;
  }

  /**
   * Notify all clients about screen state change
   */
  private notify(): void {
    this.notificationsGateway.notifyScreenStateChanged();
  }
}

