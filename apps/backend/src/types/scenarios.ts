// ========== SCENARIOS DOMAIN ==========

export type ScenarioId = string;

/**
 * Typ kroku w scenariuszu - każdy krok może być tylko jednego typu
 */
export type ScenarioStepType = 'text' | 'image' | 'video' | 'audio' | 'heading' | 'blank';

/**
 * Krok scenariusza - prosty format YAML:
 * - text: songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P
 * - image: ogloszenia/logo.png
 * - heading: Pieśni
 * - blank: true
 */
export type ScenarioStep =
  | { text: string }
  | { image: string }
  | { video: string }
  | { audio: string }
  | { heading: string }
  | { blank: true };

/**
 * Metadane scenariusza (nagłówek YAML)
 */
export type ScenarioMeta = {
  schemaVersion: 'scenario-1';
  id: string; // ULID
  title: string;
  description: string;
};

/**
 * Pełny dokument scenariusza
 */
export type ScenarioDoc = {
  meta: ScenarioMeta;
  steps: ScenarioStep[];
};

/**
 * Helper do pobierania typu kroku
 */
export function getStepType(step: ScenarioStep): ScenarioStepType {
  if ('text' in step) return 'text';
  if ('image' in step) return 'image';
  if ('video' in step) return 'video';
  if ('audio' in step) return 'audio';
  if ('heading' in step) return 'heading';
  return 'blank';
}

/**
 * Helper do pobierania wartości kroku
 */
export function getStepValue(step: ScenarioStep): string | true {
  if ('text' in step) return step.text;
  if ('image' in step) return step.image;
  if ('video' in step) return step.video;
  if ('audio' in step) return step.audio;
  if ('heading' in step) return step.heading;
  return true;
}

