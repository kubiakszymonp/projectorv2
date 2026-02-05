import { Injectable } from '@nestjs/common';
import { ScreenState, TextDisplayItem } from '../../../types/player';
import { ScreenStateRepository } from '../repositories/screen-state.repository';
import { ScenariosService } from '../../scenarios/scenarios.service';
import { TextsService } from '../../texts/texts.service';
import { TextFormatterService } from '../../texts/text-formatter.service';
import { SettingsService } from '../../settings/settings.service';
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
    private readonly textFormatterService: TextFormatterService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Get current screen state
   */
  getState(): ScreenState {
    return this.screenStateRepo.get();
  }

  /**
   * Set screen state directly
   */
  setState(state: ScreenState): ScreenState {
    return this.screenStateRepo.set(state);
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
    const slideContent = text.slides[validSlideIndex] || '';

    // Format slide into pages
    const settings = this.settingsService.getSettings();
    const pages = this.textFormatterService.formatTextToPages(slideContent, settings.display);
    const totalPages = pages.length;

    return this.screenStateRepo.set({
      mode: 'single',
      visible: false,
      item: {
        type: 'text',
        textRef,
        slideIndex: validSlideIndex,
        totalSlides: text.slides.length,
        pageIndex: 0,
        totalPages,
        slideContent: pages[0] || '',
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
      this.textFormatterService,
      this.settingsService,
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
   * Navigate pages/slides in text (prev/next)
   * Handles page navigation within slides, and slide navigation when on last/first page
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

    const settings = this.settingsService.getSettings();
    let newSlideIndex = textItem.slideIndex;
    let newPageIndex = textItem.pageIndex;
    let newSlideContent = textItem.slideContent;

    if (direction === 'next') {
      // Try to go to next page in current slide
      if (textItem.pageIndex < textItem.totalPages - 1) {
        newPageIndex = textItem.pageIndex + 1;
        const slideContent = text.slides[textItem.slideIndex] || '';
        const pages = this.textFormatterService.formatTextToPages(slideContent, settings.display);
        newSlideContent = pages[newPageIndex] || '';
      } else {
        // On last page, go to next slide
        const maxSlide = text.slides.length - 1;
        if (textItem.slideIndex < maxSlide) {
          newSlideIndex = textItem.slideIndex + 1;
          newPageIndex = 0;
          const slideContent = text.slides[newSlideIndex] || '';
          const pages = this.textFormatterService.formatTextToPages(slideContent, settings.display);
          newSlideContent = pages[0] || '';
        } else {
          // Already on last page of last slide, do nothing
          return state;
        }
      }
    } else {
      // Try to go to previous page in current slide
      if (textItem.pageIndex > 0) {
        newPageIndex = textItem.pageIndex - 1;
        const slideContent = text.slides[textItem.slideIndex] || '';
        const pages = this.textFormatterService.formatTextToPages(slideContent, settings.display);
        newSlideContent = pages[newPageIndex] || '';
      } else {
        // On first page, go to previous slide
        if (textItem.slideIndex > 0) {
          newSlideIndex = textItem.slideIndex - 1;
          const slideContent = text.slides[newSlideIndex] || '';
          const pages = this.textFormatterService.formatTextToPages(slideContent, settings.display);
          newPageIndex = pages.length - 1;
          newSlideContent = pages[newPageIndex] || '';
        } else {
          // Already on first page of first slide, do nothing
          return state;
        }
      }
    }

    // Get total pages for the new slide
    const slideContent = text.slides[newSlideIndex] || '';
    const pages = this.textFormatterService.formatTextToPages(slideContent, settings.display);
    const totalPages = pages.length;

    const newTextItem: TextDisplayItem = {
      type: 'text',
      textRef: textItem.textRef,
      slideIndex: newSlideIndex,
      totalSlides: text.slides.length,
      pageIndex: newPageIndex,
      totalPages,
      slideContent: newSlideContent,
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
      this.textFormatterService,
      this.settingsService,
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


