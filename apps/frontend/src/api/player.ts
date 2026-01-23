import type { ScreenState } from '@/types/player';

const API_BASE = '/api/player';

// ========== TYPES ==========

export type SetTextData = {
  textRef: string;
  slideIndex?: number;
};

export type SetMediaData = {
  type: 'image' | 'video' | 'audio';
  path: string;
};

export type SetQRCodeData = {
  value: string;
  label?: string;
};

export type SetScenarioData = {
  scenarioId: string;
  stepIndex?: number;
};

export type NavigateDirection = 'next' | 'prev';

// ========== API FUNCTIONS ==========

/**
 * Pobiera aktualny stan ekranu
 */
export async function getScreenState(): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) throw new Error(`Failed to get screen state: ${res.statusText}`);
  return res.json();
}

/**
 * Czyści ekran
 */
export async function clearScreen(): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/clear`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to clear screen: ${res.statusText}`);
  return res.json();
}

/**
 * Ustawia tekst do wyświetlenia
 */
export async function setText(data: SetTextData): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to set text: ${res.statusText}`);
  return res.json();
}

/**
 * Ustawia medium do wyświetlenia
 */
export async function setMedia(data: SetMediaData): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to set media: ${res.statusText}`);
  return res.json();
}

/**
 * Uruchamia scenariusz
 */
export async function setScenario(data: SetScenarioData): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to set scenario: ${res.statusText}`);
  return res.json();
}

/**
 * Nawigacja slajdów (prev/next) - dla tekstu
 */
export async function navigateSlide(direction: NavigateDirection): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/slide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction }),
  });
  if (!res.ok) throw new Error(`Failed to navigate slide: ${res.statusText}`);
  return res.json();
}

/**
 * Nawigacja kroków scenariusza (prev/next)
 */
export async function navigateStep(direction: NavigateDirection): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction }),
  });
  if (!res.ok) throw new Error(`Failed to navigate step: ${res.statusText}`);
  return res.json();
}

/**
 * Przełącza widoczność zawartości
 */
export async function toggleVisibility(): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/toggle-visibility`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to toggle visibility: ${res.statusText}`);
  return res.json();
}

/**
 * Ustawia widoczność zawartości
 */
export async function setVisibility(visible: boolean): Promise<ScreenState> {
  const res = await fetch(`${API_BASE}/visibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visible }),
  });
  if (!res.ok) throw new Error(`Failed to set visibility: ${res.statusText}`);
  return res.json();
}

/**
 * Ustawia kod QR do wyświetlenia (używa bezpośredniej aktualizacji stanu)
 */
export async function setQRCode(data: SetQRCodeData): Promise<ScreenState> {
  const newState: ScreenState = {
    mode: 'single',
    visible: true,
    item: {
      type: 'qrcode',
      value: data.value,
      label: data.label,
    },
  };
  
  const res = await fetch(`${API_BASE}/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newState),
  });
  if (!res.ok) throw new Error(`Failed to set QR code: ${res.statusText}`);
  return res.json();
}

