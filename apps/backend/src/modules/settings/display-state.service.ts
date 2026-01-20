import { Injectable } from '@nestjs/common';
import {
  DisplayState,
  DisplayContentType,
  DisplayContent,
  TextDisplayContent,
  MediaDisplayContent,
  AnnouncementDisplayContent,
  INITIAL_DISPLAY_STATE,
} from '../../types/settings';
import { UpdateDisplayStateDto } from '../../types/settings.dto';

/**
 * Service responsible for managing current display state.
 * State is kept in-memory and always starts with blank (black screen).
 * 
 * SRP: Only handles display state, not settings persistence.
 */
@Injectable()
export class DisplayStateService {
  private state: DisplayState;

  constructor() {
    this.state = this.createInitialState();
  }

  /**
   * Get current display state
   */
  getState(): DisplayState {
    return structuredClone(this.state);
  }

  /**
   * Update display state based on content type
   */
  updateState(dto: UpdateDisplayStateDto): DisplayState {
    const content = this.buildContent(dto);
    
    this.state = {
      type: dto.type,
      content,
      updatedAt: new Date().toISOString(),
    };

    return this.getState();
  }

  /**
   * Clear display (show black screen)
   */
  clearDisplay(): DisplayState {
    this.state = this.createInitialState();
    return this.getState();
  }

  /**
   * Display a text slide (song, reading, etc.)
   */
  displayText(
    textId: string,
    verseIndex: number,
    text: string,
    title?: string,
  ): DisplayState {
    const content: TextDisplayContent = {
      textId,
      verseIndex,
      text,
      title,
    };

    this.state = {
      type: 'text',
      content,
      updatedAt: new Date().toISOString(),
    };

    return this.getState();
  }

  /**
   * Display media (image or video)
   */
  displayMedia(mediaPath: string, mediaType: 'image' | 'video'): DisplayState {
    const content: MediaDisplayContent = {
      mediaPath,
      mediaType,
    };

    this.state = {
      type: mediaType,
      content,
      updatedAt: new Date().toISOString(),
    };

    return this.getState();
  }

  /**
   * Display announcement text
   */
  displayAnnouncement(text: string): DisplayState {
    const content: AnnouncementDisplayContent = {
      text,
    };

    this.state = {
      type: 'announcement',
      content,
      updatedAt: new Date().toISOString(),
    };

    return this.getState();
  }

  /**
   * Create initial blank state
   */
  private createInitialState(): DisplayState {
    return {
      ...INITIAL_DISPLAY_STATE,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Build content object from DTO based on type
   */
  private buildContent(dto: UpdateDisplayStateDto): DisplayContent {
    switch (dto.type) {
      case 'blank':
        return null;

      case 'text':
        return {
          textId: dto.textId!,
          verseIndex: dto.verseIndex!,
          text: dto.text!,
          title: dto.title,
        } as TextDisplayContent;

      case 'image':
      case 'video':
        return {
          mediaPath: dto.mediaPath!,
          mediaType: dto.type,
        } as MediaDisplayContent;

      case 'announcement':
        return {
          text: dto.text!,
        } as AnnouncementDisplayContent;

      default:
        return null;
    }
  }
}

