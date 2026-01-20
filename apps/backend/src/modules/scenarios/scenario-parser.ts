import yaml from 'js-yaml';
import { ScenarioDoc, ScenarioMeta, ScenarioStep } from '../../types/scenarios';

export class ScenarioParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScenarioParseError';
  }
}

const VALID_STEP_KEYS = ['text', 'image', 'video', 'audio', 'heading', 'blank'] as const;

function isValidStepKey(key: string): key is typeof VALID_STEP_KEYS[number] {
  return VALID_STEP_KEYS.includes(key as typeof VALID_STEP_KEYS[number]);
}

function validateStep(step: unknown, index: number): ScenarioStep {
  if (!step || typeof step !== 'object') {
    throw new ScenarioParseError(`Step ${index}: must be an object`);
  }

  const stepObj = step as Record<string, unknown>;
  const keys = Object.keys(stepObj);

  if (keys.length !== 1) {
    throw new ScenarioParseError(
      `Step ${index}: must have exactly one key (text, image, video, audio, heading, or blank)`,
    );
  }

  const key = keys[0];
  if (!isValidStepKey(key)) {
    throw new ScenarioParseError(
      `Step ${index}: invalid type "${key}". Valid types: ${VALID_STEP_KEYS.join(', ')}`,
    );
  }

  const value = stepObj[key];

  if (key === 'blank') {
    if (value !== true) {
      throw new ScenarioParseError(`Step ${index}: blank must be true`);
    }
    return { blank: true };
  }

  if (typeof value !== 'string' || !value.trim()) {
    throw new ScenarioParseError(`Step ${index}: ${key} must be a non-empty string`);
  }

  return { [key]: value.trim() } as ScenarioStep;
}

function validateScenarioMeta(data: unknown): ScenarioMeta {
  if (!data || typeof data !== 'object') {
    throw new ScenarioParseError('Invalid YAML structure');
  }

  const doc = data as Record<string, unknown>;

  if (doc.schemaVersion !== 'scenario-1') {
    throw new ScenarioParseError('Invalid or missing schemaVersion (expected "scenario-1")');
  }

  if (typeof doc.id !== 'string' || !doc.id) {
    throw new ScenarioParseError('Invalid or missing id');
  }

  if (typeof doc.title !== 'string' || !doc.title) {
    throw new ScenarioParseError('Invalid or missing title');
  }

  const description = doc.description ?? '';
  if (typeof description !== 'string') {
    throw new ScenarioParseError('Invalid description (must be string)');
  }

  return {
    schemaVersion: 'scenario-1',
    id: doc.id,
    title: doc.title,
    description,
  };
}

function validateSteps(data: unknown): ScenarioStep[] {
  if (!data || typeof data !== 'object') {
    throw new ScenarioParseError('Invalid YAML structure');
  }

  const doc = data as Record<string, unknown>;
  const steps = doc.steps;

  if (!Array.isArray(steps)) {
    throw new ScenarioParseError('Missing or invalid steps array');
  }

  return steps.map((step, index) => validateStep(step, index));
}

export function parseScenarioFile(content: string): ScenarioDoc {
  let data: unknown;
  try {
    data = yaml.load(content);
  } catch (err) {
    throw new ScenarioParseError(`YAML parse error: ${(err as Error).message}`);
  }

  const meta = validateScenarioMeta(data);
  const steps = validateSteps(data);

  return { meta, steps };
}

export function buildScenarioFile(meta: ScenarioMeta, steps: ScenarioStep[]): string {
  const doc = {
    schemaVersion: meta.schemaVersion,
    id: meta.id,
    title: meta.title,
    description: meta.description,
    steps,
  };

  return yaml.dump(doc, {
    indent: 2,
    lineWidth: -1, // nie łam linii
    quotingType: '"',
    forceQuotes: false,
  });
}

