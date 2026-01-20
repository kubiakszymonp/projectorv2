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
  },
  wifi: {
    ssid: '',
    password: '',
  },
};

// ========== DISPLAY STATE (IN-MEMORY) ==========

/**
 * Types of content that can be displayed
 */
export type DisplayContentType = 'blank' | 'song' | 'image' | 'video' | 'announcement';

/**
 * Content for displaying a song verse
 */
export interface SongDisplayContent {
  songId: string;
  verseIndex: number;
  text: string;
  title?: string;
}

/**
 * Content for displaying media (image/video)
 */
export interface MediaDisplayContent {
  mediaPath: string;
  mediaType: 'image' | 'video';
}

/**
 * Content for displaying an announcement
 */
export interface AnnouncementDisplayContent {
  text: string;
}

/**
 * Union type for all display content types
 */
export type DisplayContent = 
  | SongDisplayContent 
  | MediaDisplayContent 
  | AnnouncementDisplayContent 
  | null;

/**
 * Current display state (what is shown on projector)
 * Always starts with blank (black screen)
 */
export interface DisplayState {
  type: DisplayContentType;
  content: DisplayContent;
  updatedAt: string;
}

/**
 * Initial blank display state
 */
export const INITIAL_DISPLAY_STATE: DisplayState = {
  type: 'blank',
  content: null,
  updatedAt: new Date().toISOString(),
};

// ========== API RESPONSES ==========

export interface SettingsResponse {
  settings: ProjectorSettings;
}

export interface DisplayStateResponse {
  state: DisplayState;
}

