// ========== PLAYER/SCREEN STATE DOMAIN ==========

/**
 * Typ wyświetlanego elementu
 */
export type DisplayItemType = 'text' | 'image' | 'video' | 'audio' | 'heading' | 'blank' | 'qrcode';

/**
 * Pojedynczy element tekstowy do wyświetlenia
 */
export type TextDisplayItem = {
  type: 'text';
  textRef: string; // referencja do tekstu (domain/slug__id)
  slideIndex: number; // aktualny slajd (0-based)
  totalSlides: number; // łączna liczba slajdów
  pageIndex: number; // aktualna strona w slajdzie (0-based)
  totalPages: number; // łączna liczba stron w slajdzie
  slideContent: string; // zawartość aktualnej strony
};

/**
 * Element multimedialny do wyświetlenia
 */
export type MediaDisplayItem = {
  type: 'image' | 'video' | 'audio';
  path: string; // ścieżka do pliku
};

/**
 * Nagłówek do wyświetlenia
 */
export type HeadingDisplayItem = {
  type: 'heading';
  content: string;
};

/**
 * Pusty slajd
 */
export type BlankDisplayItem = {
  type: 'blank';
};

/**
 * Kod QR do wyświetlenia
 */
export type QRCodeDisplayItem = {
  type: 'qrcode';
  value: string; // wartość do zakodowania w QR
  label?: string; // opcjonalna etykieta pod kodem
};

/**
 * Element do wyświetlenia (union type)
 */
export type DisplayItem =
  | TextDisplayItem
  | MediaDisplayItem
  | HeadingDisplayItem
  | BlankDisplayItem
  | QRCodeDisplayItem;

/**
 * Tryb wyświetlania
 */
export type ScreenMode = 'empty' | 'single' | 'scenario';

/**
 * Stan ekranu - pusty (nic nie wyświetlane)
 */
export type EmptyScreenState = {
  mode: 'empty';
};

/**
 * Stan ekranu - pojedynczy element (tekst lub media)
 */
export type SingleItemScreenState = {
  mode: 'single';
  item: DisplayItem;
  visible: boolean; // czy zawartość jest widoczna na ekranie
};

/**
 * Stan ekranu - scenariusz
 */
export type ScenarioScreenState = {
  mode: 'scenario';
  scenarioId: string;
  scenarioTitle: string;
  stepIndex: number; // aktualny krok scenariusza (0-based)
  totalSteps: number; // łączna liczba kroków
  currentItem: DisplayItem; // aktualnie wyświetlany element
  visible: boolean; // czy zawartość jest widoczna na ekranie
};

/**
 * Pełny stan ekranu (union type)
 */
export type ScreenState = EmptyScreenState | SingleItemScreenState | ScenarioScreenState;

