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
 * What to show when the screen is blank/empty
 */
export type BlankScreenMode = 'black' | 'clock' | 'logo';

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
  blankScreen: BlankScreenMode;
  blankLogoPath: string;
  showPageNumber: boolean;
  autoFitText: boolean;
}

/**
 * WiFi network configuration
 */
export interface WifiSettings {
  ssid: string;
  password: string;
}

/**
 * Complete projector settings (persisted in YAML)
 */
export interface ProjectorSettings {
  display: DisplaySettings;
  wifi: WifiSettings;
}

/**
 * Default settings for fresh installation
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
    blankScreen: 'black',
    blankLogoPath: '',
    showPageNumber: false,
    autoFitText: false,
  },
  wifi: {
    ssid: '',
    password: '',
  },
};

// ========== API RESPONSES ==========

export interface SettingsResponse {
  settings: ProjectorSettings;
}

