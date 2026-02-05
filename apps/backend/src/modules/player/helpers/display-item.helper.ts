import { DisplayItem, TextDisplayItem } from '../../../types/player';
import { getStepType, getStepValue } from '../../../types/scenarios';
import { TextsService } from '../../texts/texts.service';

/**
 * Helper functions for converting scenario steps to display items
 */
export class DisplayItemHelper {
  /**
   * Extract text ID from text reference
   * Format: "domain__textId" or just "textId"
   */
  static extractTextIdFromRef(textRef: string): string {
    const parts = textRef.split('__');
    return parts[parts.length - 1];
  }

  /**
   * Convert scenario step to display item
   */
  static async fromStep(
    step: import('../../../types/scenarios').ScenarioStep,
    textsService: TextsService,
  ): Promise<DisplayItem> {
    const stepType = getStepType(step);
    const stepValue = getStepValue(step);

    switch (stepType) {
      case 'text': {
        const textRef = stepValue as string;
        const textId = this.extractTextIdFromRef(textRef);
        const text = await textsService.findById(textId);
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




