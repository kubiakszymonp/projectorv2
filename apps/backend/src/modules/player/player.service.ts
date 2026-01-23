import { Injectable } from '@nestjs/common';
import { ScreenStateService } from './services/screen-state.service';
import type { ScreenState } from '../../types/player';

/**
 * PlayerService - Facade for player operations
 * Delegates to ScreenStateService for business logic
 */
@Injectable()
export class PlayerService {
  constructor(private readonly screenStateService: ScreenStateService) {}

  getState(): ScreenState {
    return this.screenStateService.getState();
  }

  setState(state: ScreenState): ScreenState {
    return this.screenStateService.setState(state);
  }

  clearScreen(): ScreenState {
    return this.screenStateService.clearScreen();
  }

  toggleVisibility(): ScreenState {
    return this.screenStateService.toggleVisibility();
  }

  setVisibility(visible: boolean): ScreenState {
    return this.screenStateService.setVisibility(visible);
  }

  async setText(textRef: string, slideIndex = 0): Promise<ScreenState> {
    return this.screenStateService.setText(textRef, slideIndex);
  }

  setMedia(type: 'image' | 'video' | 'audio', path: string): ScreenState {
    return this.screenStateService.setMedia(type, path);
  }

  async setScenario(scenarioId: string, stepIndex = 0): Promise<ScreenState> {
    return this.screenStateService.setScenario(scenarioId, stepIndex);
  }

  async navigateSlide(direction: 'next' | 'prev'): Promise<ScreenState> {
    return this.screenStateService.navigateSlide(direction);
  }

  async navigateStep(direction: 'next' | 'prev'): Promise<ScreenState> {
    return this.screenStateService.navigateStep(direction);
  }
}
