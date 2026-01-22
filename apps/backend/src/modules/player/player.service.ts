import { Injectable } from '@nestjs/common';
import {
  ScreenState,
  DEFAULT_SCREEN_STATE,
  TextDisplayItem,
  DisplayItem,
} from '../../types/player';
import { ScenariosService } from '../scenarios/scenarios.service';
import { TextsService } from '../texts/texts.service';
import { getStepType, getStepValue } from '../../types/scenarios';

@Injectable()
export class PlayerService {
  private screenState: ScreenState = DEFAULT_SCREEN_STATE;

  constructor(
    private readonly scenariosService: ScenariosService,
    private readonly textsService: TextsService,
  ) {}

  /**
   * Pobiera aktualny stan ekranu
   */
  getState(): ScreenState {
    return this.screenState;
  }

  /**
   * Czyści ekran (ustawia stan pusty)
   */
  clearScreen(): ScreenState {
    this.screenState = { mode: 'empty' };
    return this.screenState;
  }

  /**
   * Przełącza widoczność zawartości na ekranie
   */
  toggleVisibility(): ScreenState {
    if (this.screenState.mode === 'single') {
      this.screenState = {
        ...this.screenState,
        visible: !this.screenState.visible,
      };
    } else if (this.screenState.mode === 'scenario') {
      this.screenState = {
        ...this.screenState,
        visible: !this.screenState.visible,
      };
    }
    return this.screenState;
  }

  /**
   * Ustawia widoczność zawartości
   */
  setVisibility(visible: boolean): ScreenState {
    if (this.screenState.mode === 'single') {
      this.screenState = {
        ...this.screenState,
        visible,
      };
    } else if (this.screenState.mode === 'scenario') {
      this.screenState = {
        ...this.screenState,
        visible,
      };
    }
    return this.screenState;
  }

  /**
   * Ustawia pojedynczy tekst do wyświetlenia
   */
  async setText(textRef: string, slideIndex = 0): Promise<ScreenState> {
    const textId = this.extractTextIdFromRef(textRef);
    const text = await this.textsService.findById(textId);
    if (!text) {
      throw new Error(`Text not found: ${textId}`);
    }

    const maxSlide = text.slides.length - 1;
    const validSlideIndex = Math.max(0, Math.min(slideIndex, maxSlide));

    this.screenState = {
      mode: 'single',
      visible: false, // domyślnie ukryte - user musi włączyć
      item: {
        type: 'text',
        textRef,
        slideIndex: validSlideIndex,
        totalSlides: text.slides.length,
        slideContent: text.slides[validSlideIndex] || '',
      },
    };

    return this.screenState;
  }

  /**
   * Ustawia medium do wyświetlenia
   */
  setMedia(type: 'image' | 'video' | 'audio', path: string): ScreenState {
    this.screenState = {
      mode: 'single',
      visible: false, // domyślnie ukryte
      item: {
        type,
        path,
      },
    };
    return this.screenState;
  }

  /**
   * Uruchamia scenariusz
   */
  async setScenario(scenarioId: string, stepIndex = 0): Promise<ScreenState> {
    const scenario = await this.scenariosService.findById(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    if (scenario.steps.length === 0) {
      this.screenState = { mode: 'empty' };
      return this.screenState;
    }

    const maxStep = scenario.steps.length - 1;
    const validStepIndex = Math.max(0, Math.min(stepIndex, maxStep));

    const currentItem = await this.getDisplayItemFromStep(
      scenario.steps[validStepIndex],
    );

    this.screenState = {
      mode: 'scenario',
      visible: false, // domyślnie ukryte
      scenarioId,
      scenarioTitle: scenario.meta.title,
      stepIndex: validStepIndex,
      totalSteps: scenario.steps.length,
      currentItem,
    };

    return this.screenState;
  }

  /**
   * Nawigacja slajdów tekstu (prev/next)
   */
  async navigateSlide(direction: 'next' | 'prev'): Promise<ScreenState> {
    const textItem = this.getCurrentTextItem();
    if (!textItem) {
      return this.screenState;
    }

    const textId = this.extractTextIdFromRef(textItem.textRef);
    const text = await this.textsService.findById(textId);
    if (!text) {
      return this.screenState;
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

    if (this.screenState.mode === 'single') {
      this.screenState = {
        ...this.screenState,
        item: newTextItem,
      };
    } else if (this.screenState.mode === 'scenario') {
      this.screenState = {
        ...this.screenState,
        currentItem: newTextItem,
      };
    }

    return this.screenState;
  }

  /**
   * Nawigacja kroków scenariusza (prev/next)
   */
  async navigateStep(direction: 'next' | 'prev'): Promise<ScreenState> {
    if (this.screenState.mode !== 'scenario') {
      return this.screenState;
    }

    const scenario = await this.scenariosService.findById(
      this.screenState.scenarioId,
    );
    if (!scenario) {
      return this.screenState;
    }
    const maxStep = scenario.steps.length - 1;

    let newStepIndex = this.screenState.stepIndex;
    if (direction === 'next') {
      newStepIndex = Math.min(this.screenState.stepIndex + 1, maxStep);
    } else {
      newStepIndex = Math.max(this.screenState.stepIndex - 1, 0);
    }

    const currentItem = await this.getDisplayItemFromStep(
      scenario.steps[newStepIndex],
    );

    this.screenState = {
      ...this.screenState,
      stepIndex: newStepIndex,
      currentItem,
    };

    return this.screenState;
  }

  /**
   * Helper - pobiera aktualny element tekstowy (jeśli jest)
   */
  private getCurrentTextItem(): TextDisplayItem | null {
    if (this.screenState.mode === 'single') {
      if (this.screenState.item.type === 'text') {
        return this.screenState.item;
      }
    } else if (this.screenState.mode === 'scenario') {
      if (this.screenState.currentItem.type === 'text') {
        return this.screenState.currentItem;
      }
    }
    return null;
  }

  /**
   * Helper - wyciąga ID tekstu z referencji
   */
  private extractTextIdFromRef(textRef: string): string {
    const parts = textRef.split('__');
    return parts[parts.length - 1];
  }

  /**
   * Helper - konwertuje krok scenariusza na DisplayItem
   */
  private async getDisplayItemFromStep(
    step: import('../../types/scenarios').ScenarioStep,
  ): Promise<DisplayItem> {
    const stepType = getStepType(step);
    const stepValue = getStepValue(step);

    switch (stepType) {
      case 'text': {
        const textRef = stepValue as string;
        const textId = this.extractTextIdFromRef(textRef);
        const text = await this.textsService.findById(textId);
        return {
          type: 'text',
          textRef,
          slideIndex: 0,
          totalSlides: text?.slides.length ?? 0,
          slideContent: text?.slides[0] ?? '',
        };
      }
      case 'image':
        return {
          type: 'image',
          path: stepValue as string,
        };
      case 'video':
        return {
          type: 'video',
          path: stepValue as string,
        };
      case 'audio':
        return {
          type: 'audio',
          path: stepValue as string,
        };
      case 'heading':
        return {
          type: 'heading',
          content: stepValue as string,
        };
      case 'blank':
      default:
        return {
          type: 'blank',
        };
    }
  }
}
