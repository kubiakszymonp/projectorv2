import type { TextDoc } from '@/types/texts';

const API_BASE = '/api/texts';

// ========== TYPES ==========

export type CreateTextData = {
  domain: string;
  title: string;
  description?: string;
  categories?: string[];
  content?: string;
};

export type UpdateTextData = {
  domain?: string;
  title?: string;
  description?: string;
  categories?: string[];
  content?: string;
};

// ========== API FUNCTIONS ==========

/**
 * Pobiera listę wszystkich domen (folderów z tekstami)
 */
export async function getDomains(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/domains`);
  if (!res.ok) throw new Error(`Failed to get domains: ${res.statusText}`);
  return res.json();
}

/**
 * Tworzy nową domenę
 */
export async function createDomain(name: string): Promise<void> {
  const res = await fetch(`${API_BASE}/domains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create domain: ${res.statusText}`);
}

/**
 * Pobiera wszystkie teksty
 */
export async function getAllTexts(): Promise<TextDoc[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`Failed to get texts: ${res.statusText}`);
  return res.json();
}

/**
 * Pobiera tekst po ID
 */
export async function getTextById(id: string): Promise<TextDoc> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to get text: ${res.statusText}`);
  return res.json();
}

/**
 * Pobiera tekst po ścieżce (domain/filename)
 */
export async function getTextByPath(path: string): Promise<TextDoc> {
  const res = await fetch(`${API_BASE}/by-path?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Failed to get text: ${res.statusText}`);
  return res.json();
}

/**
 * Tworzy nowy tekst
 */
export async function createText(data: CreateTextData): Promise<TextDoc> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create text: ${res.statusText}`);
  return res.json();
}

/**
 * Aktualizuje tekst
 */
export async function updateText(id: string, data: UpdateTextData): Promise<TextDoc> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update text: ${res.statusText}`);
  return res.json();
}

/**
 * Usuwa tekst
 */
export async function deleteText(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete text: ${res.statusText}`);
}

/**
 * Przeładowuje teksty z dysku
 */
export async function reloadTexts(): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE}/reload`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reload texts: ${res.statusText}`);
  return res.json();
}



