import type { ProjectorSettings, DisplaySettings, WifiSettings } from '@/types/settings';

const API_BASE = '/api/settings';

// ========== TYPES ==========

export type UpdateDisplaySettingsData = Partial<DisplaySettings>;

export type UpdateWifiSettingsData = Partial<WifiSettings>;

export type UpdateSettingsData = {
  display?: UpdateDisplaySettingsData;
  wifi?: UpdateWifiSettingsData;
};

// ========== API FUNCTIONS ==========

/**
 * Pobiera aktualne ustawienia
 */
export async function getSettings(): Promise<ProjectorSettings> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`Failed to get settings: ${res.statusText}`);
  const data = await res.json();
  return data.settings;
}

/**
 * Aktualizuje ustawienia (częściowa aktualizacja)
 */
export async function updateSettings(data: UpdateSettingsData): Promise<ProjectorSettings> {
  const res = await fetch(API_BASE, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update settings: ${res.statusText}`);
  const result = await res.json();
  return result.settings;
}

/**
 * Zastępuje wszystkie ustawienia (pełna aktualizacja)
 */
export async function replaceSettings(data: ProjectorSettings): Promise<ProjectorSettings> {
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to replace settings: ${res.statusText}`);
  const result = await res.json();
  return result.settings;
}

/**
 * Resetuje ustawienia do domyślnych
 */
export async function resetSettings(): Promise<ProjectorSettings> {
  const res = await fetch(API_BASE, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to reset settings: ${res.statusText}`);
  const result = await res.json();
  return result.settings;
}



