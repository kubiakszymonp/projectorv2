// ========== SCENARIOS DOMAIN ==========

export type ScenarioId = string;

/**
 * Typ kroku w scenariuszu
 */
export type ScenarioStepType = 'text' | 'image' | 'video' | 'audio' | 'heading' | 'blank';

/**
 * Krok scenariusza - union type dla różnych typów kroków
 */
export type ScenarioStep =
  | { text: string }
  | { image: string }
  | { video: string }
  | { audio: string }
  | { heading: string }
  | { blank: true };

/**
 * Metadane scenariusza
 */
export type ScenarioMeta = {
  schemaVersion: 'scenario-1';
  id: string;
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

/**
 * Helper do tworzenia kroku tekstowego
 */
export function createTextStep(textRef: string): ScenarioStep {
  return { text: textRef };
}

/**
 * Helper do tworzenia kroku z nagłówkiem
 */
export function createHeadingStep(heading: string): ScenarioStep {
  return { heading };
}

/**
 * Helper do tworzenia pustego slajdu
 */
export function createBlankStep(): ScenarioStep {
  return { blank: true };
}

