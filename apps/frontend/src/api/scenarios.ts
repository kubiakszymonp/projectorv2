import type { ScenarioDoc, ScenarioStep } from '@/types/scenarios';

const API_BASE = '/api/scenarios';

// ========== TYPES ==========

export type CreateScenarioData = {
  title: string;
  description?: string;
  steps?: ScenarioStep[];
};

export type UpdateScenarioData = {
  title?: string;
  description?: string;
  steps?: ScenarioStep[];
};

// ========== API FUNCTIONS ==========

/**
 * Pobiera wszystkie scenariusze
 */
export async function getAllScenarios(): Promise<ScenarioDoc[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`Failed to get scenarios: ${res.statusText}`);
  return res.json();
}

/**
 * Pobiera scenariusz po ID
 */
export async function getScenarioById(id: string): Promise<ScenarioDoc> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to get scenario: ${res.statusText}`);
  return res.json();
}

/**
 * Tworzy nowy scenariusz
 */
export async function createScenario(data: CreateScenarioData): Promise<ScenarioDoc> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create scenario: ${res.statusText}`);
  return res.json();
}

/**
 * Aktualizuje scenariusz
 */
export async function updateScenario(id: string, data: UpdateScenarioData): Promise<ScenarioDoc> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update scenario: ${res.statusText}`);
  return res.json();
}

/**
 * Usuwa scenariusz
 */
export async function deleteScenario(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete scenario: ${res.statusText}`);
}

/**
 * Przeładowuje scenariusze z dysku
 */
export async function reloadScenarios(): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE}/reload`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reload scenarios: ${res.statusText}`);
  return res.json();
}

/**
 * Dodaje krok na końcu scenariusza
 */
export async function addStepToScenario(
  scenarioId: string,
  step: ScenarioStep
): Promise<ScenarioDoc> {
  const scenario = await getScenarioById(scenarioId);
  const updatedSteps = [...scenario.steps, step];
  return updateScenario(scenarioId, { steps: updatedSteps });
}

/**
 * Usuwa krok ze scenariusza
 */
export async function removeStepFromScenario(
  scenarioId: string,
  stepIndex: number
): Promise<ScenarioDoc> {
  const scenario = await getScenarioById(scenarioId);
  const updatedSteps = scenario.steps.filter((_, i) => i !== stepIndex);
  return updateScenario(scenarioId, { steps: updatedSteps });
}

/**
 * Przesuwa krok w scenariuszu
 */
export async function reorderScenarioSteps(
  scenarioId: string,
  fromIndex: number,
  toIndex: number
): Promise<ScenarioDoc> {
  const scenario = await getScenarioById(scenarioId);
  const steps = [...scenario.steps];
  const [removed] = steps.splice(fromIndex, 1);
  steps.splice(toIndex, 0, removed);
  return updateScenario(scenarioId, { steps });
}




