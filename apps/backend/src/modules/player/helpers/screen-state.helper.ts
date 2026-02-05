import { ScreenState, TextDisplayItem } from '../../../types/player';

/**
 * Helper functions for working with screen state
 */
export class ScreenStateHelper {
  /**
   * Get current text item from screen state (if exists)
   */
  static getCurrentTextItem(state: ScreenState): TextDisplayItem | null {
    if (state.mode === 'single') {
      if (state.item.type === 'text') {
        return state.item;
      }
    } else if (state.mode === 'scenario') {
      if (state.currentItem.type === 'text') {
        return state.currentItem;
      }
    }
    return null;
  }

  /**
   * Check if screen state has visible content
   */
  static isVisible(state: ScreenState): boolean {
    return state.mode !== 'empty' && state.visible !== false;
  }
}




