// ========== SETTINGS DOMAIN ==========

/**
 * Padding configuration for display
 */
export interface DisplayPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Text alignment options
 */
export type TextAlign = 'left' | 'center' | 'right';

/**
 * Display styling configuration
 */
export interface DisplaySettings {
  fontSize: number;
  fontFamily: string;
  padding: DisplayPadding;
  lineHeight: number;
  letterSpacing: number;
  textAlign: TextAlign;
  backgroundColor: string;
  textColor: string;
  maxLinesPerPage: number;
  maxCharsPerLine: number;
}

/**
 * WiFi network configuration
 */
export interface WifiSettings {
  ssid: string;
  password: string;
}

/**
 * Complete projector settings
 */
export interface ProjectorSettings {
  display: DisplaySettings;
  wifi: WifiSettings;
}

/**
 * Default settings for frontend fallback
 */
export const DEFAULT_SETTINGS: ProjectorSettings = {
  display: {
    fontSize: 48,
    fontFamily: 'Arial, sans-serif',
    padding: {
      top: 40,
      right: 60,
      bottom: 40,
      left: 60,
    },
    lineHeight: 1.4,
    letterSpacing: 0,
    textAlign: 'center',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    maxLinesPerPage: 8,
    maxCharsPerLine: 50,
  },
  wifi: {
    ssid: '',
    password: '',
  },
};




