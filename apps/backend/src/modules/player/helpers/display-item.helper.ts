import { Injectable } from '@nestjs/common';
import { DisplayItem } from '../../../types/player';
import { getStepType, getStepValue, ScenarioStep } from '../../../types/scenarios';
import { TextsService } from '../../texts/texts.service';
import { TextFormatterService } from '../../texts/text-formatter.service';
import { SettingsService } from '../../settings/settings.service';

/**
 * Converts scenario steps into display items. Injectable so its collaborators
 * come through normal DI instead of being threaded through every call.
 */
@Injectable()
export class DisplayItemHelper {
  constructor(
    private readonly textsService: TextsService,
    private readonly textFormatterService: TextFormatterService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Extract text ID from a text reference ("domain/slug__textId" or "textId").
   */
  static extractTextIdFromRef(textRef: string): string {
    const parts = textRef.split('__');
    return parts[parts.length - 1];
  }

  async fromStep(step: ScenarioStep): Promise<DisplayItem> {
    const stepType = getStepType(step);
    const stepValue = getStepValue(step);

    switch (stepType) {
      case 'text': {
        const textRef = stepValue as string;
        const textId = DisplayItemHelper.extractTextIdFromRef(textRef);
        const text = await this.textsService.findById(textId);
        if (!text || text.slides.length === 0) {
          return {
            type: 'text',
            textRef,
            slideIndex: 0,
            totalSlides: text?.slides.length ?? 0,
            pageIndex: 0,
            totalPages: 0,
            slideContent: '',
          };
        }

        const settings = this.settingsService.getSettings();
        const slideContent = text.slides[0] || '';
        const pages = this.textFormatterService.formatTextToPages(
          slideContent,
          settings.display,
        );

        return {
          type: 'text',
          textRef,
          slideIndex: 0,
          totalSlides: text.slides.length,
          pageIndex: 0,
          totalPages: pages.length,
          slideContent: pages[0] || '',
        };
      }
      case 'image':
        return { type: 'image', path: stepValue as string };
      case 'video':
        return { type: 'video', path: stepValue as string };
      case 'audio':
        return { type: 'audio', path: stepValue as string };
      case 'heading':
        return { type: 'heading', content: stepValue as string };
      case 'qrcode':
        return { type: 'qrcode', value: stepValue as string };
      case 'blank':
      default:
        return { type: 'blank' };
    }
  }
}
