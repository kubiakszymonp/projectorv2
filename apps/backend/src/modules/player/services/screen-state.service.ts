import { Injectable } from '@nestjs/common';
import { ScreenState, TextDisplayItem } from '../../../types/player';
import { ScreenStateRepository } from '../repositories/screen-state.repository';
import { ScenariosService } from '../../scenarios/scenarios.service';
import { TextsService } from '../../texts/texts.service';
import { DisplayItemHelper } from '../helpers/display-item.helper';
import { ScreenStateHelper } from '../helpers/screen-state.helper';

/**
 * Service for managing screen state operations.
 * Handles business logic for displaying content on screen.
 */
@Injectable()
export class ScreenStateService {
  constructor(
    private readonly screenStateRepo: ScreenStateRepository,
    private readonly scenariosService: ScenariosService,
    private readonly textsService: TextsService,
  ) {}

  /**
   * Get current screen state
   */
  getState(): ScreenState {
    return this.screenStateRepo.get();
  }

  /**
   * Clear screen (set to empty state)
   */
  clearScreen(): ScreenState {
    return this.screenStateRepo.set({ mode: 'empty' });
  }

  /**
   * Toggle visibility of screen content
   */
  toggleVisibility(): ScreenState {
    return this.screenStateRepo.update((state) => {
      if (state.mode === 'single' || state.mode === 'scenario') {
        return {
          ...state,
          visible: !state.visible,
        };
      }
      return state;
    });
  }

  /**
   * Set visibility of screen content
   */
  setVisibility(visible: boolean): ScreenState {
    return this.screenStateRepo.update((state) => {
      if (state.mode === 'single' || state.mode === 'scenario') {
        return {
          ...state,
          visible,
        };
      }
      return state;
    });
  }

  /**
   * Set text to display
   */
  async setText(textRef: string, slideIndex = 0): Promise<ScreenState> {
    const textId = DisplayItemHelper.extractTextIdFromRef(textRef);
    const text = await this.textsService.findById(textId);
    if (!text) {
      throw new Error(`Text not found: ${textId}`);
    }

    const maxSlide = text.slides.length - 1;
    const validSlideIndex = Math.max(0, Math.min(slideIndex, maxSlide));

    return this.screenStateRepo.set({
      mode: 'single',
      visible: false,
      item: {
        type: 'text',
        textRef,
        slideIndex: validSlideIndex,
        totalSlides: text.slides.length,
        slideContent: text.slides[validSlideIndex] || '',
      },
    });
  }

  /**
   * Set media to display
   */
  setMedia(type: 'image' | 'video' | 'audio', path: string): ScreenState {
    return this.screenStateRepo.set({
      mode: 'single',
      visible: false,
      item: {
        type,
        path,
      },
    });
  }

  /**
   * Set scenario to play
   */
  async setScenario(scenarioId: string, stepIndex = 0): Promise<ScreenState> {
    const scenario = await this.scenariosService.findById(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    if (scenario.steps.length === 0) {
      return this.screenStateRepo.set({ mode: 'empty' });
    }

    const maxStep = scenario.steps.length - 1;
    const validStepIndex = Math.max(0, Math.min(stepIndex, maxStep));

    const currentItem = await DisplayItemHelper.fromStep(
      scenario.steps[validStepIndex],
      this.textsService,
    );

    return this.screenStateRepo.set({
      mode: 'scenario',
      visible: false,
      scenarioId,
      scenarioTitle: scenario.meta.title,
      stepIndex: validStepIndex,
      totalSteps: scenario.steps.length,
      currentItem,
    });
  }

  /**
   * Navigate slides in text (prev/next)
   */
  async navigateSlide(direction: 'next' | 'prev'): Promise<ScreenState> {
    const state = this.screenStateRepo.get();
    const textItem = ScreenStateHelper.getCurrentTextItem(state);
    if (!textItem) {
      return state;
    }

    const textId = DisplayItemHelper.extractTextIdFromRef(textItem.textRef);
    const text = await this.textsService.findById(textId);
    if (!text) {
      return state;
    }

    const maxSlide = text.slides.length - 1;
    let newSlideIndex = textItem.slideIndex;
    if (direction === 'next') {
      newSlideIndex = Math.min(textItem.slideIndex + 1, maxSlide);
    } else {
      newSlideIndex = Math.max(textItem.slideIndex - 1, 0);
    }

    const newTextItem: TextDisplayItem = {
      type: 'text',
      textRef: textItem.textRef,
      slideIndex: newSlideIndex,
      totalSlides: text.slides.length,
      slideContent: text.slides[newSlideIndex] || '',
    };

    return this.screenStateRepo.update((currentState) => {
      if (currentState.mode === 'single') {
        return {
          ...currentState,
          item: newTextItem,
        };
      } else if (currentState.mode === 'scenario') {
        return {
          ...currentState,
          currentItem: newTextItem,
        };
      }
      return currentState;
    });
  }

  /**
   * Navigate steps in scenario (prev/next)
   */
  async navigateStep(direction: 'next' | 'prev'): Promise<ScreenState> {
    const state = this.screenStateRepo.get();
    if (state.mode !== 'scenario') {
      return state;
    }

    const scenario = await this.scenariosService.findById(state.scenarioId);
    if (!scenario) {
      return state;
    }

    const maxStep = scenario.steps.length - 1;
    let newStepIndex = state.stepIndex;
    if (direction === 'next') {
      newStepIndex = Math.min(state.stepIndex + 1, maxStep);
    } else {
      newStepIndex = Math.max(state.stepIndex - 1, 0);
    }

    const currentItem = await DisplayItemHelper.fromStep(
      scenario.steps[newStepIndex],
      this.textsService,
    );

    return this.screenStateRepo.update((currentState) => {
      if (currentState.mode === 'scenario') {
        return {
          ...currentState,
          stepIndex: newStepIndex,
          currentItem,
        };
      }
      return currentState;
    });
  }
}


