import type {
  FileListResponse,
  FolderTreeResponse,
  FileUploadResponse,
} from '@/types/files';

const API_BASE = '/api/files';

/**
 * Listuje zawartość folderu
 */
export async function listFiles(path: string = ''): Promise<FileListResponse> {
  const params = path ? `?path=${encodeURIComponent(path)}` : '';
  const res = await fetch(`${API_BASE}${params}`);
  if (!res.ok) throw new Error(`Failed to list files: ${res.statusText}`);
  return res.json();
}

/**
 * Pobiera drzewo folderów
 */
export async function getFolderTree(): Promise<FolderTreeResponse> {
  const res = await fetch(`${API_BASE}/tree`);
  if (!res.ok) throw new Error(`Failed to get folder tree: ${res.statusText}`);
  return res.json();
}

/**
 * Tworzy nowy folder
 */
export async function createFolder(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error(`Failed to create folder: ${res.statusText}`);
}

/**
 * Zmienia nazwę pliku/folderu
 */
export async function renameFile(path: string, newName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, newName }),
  });
  if (!res.ok) throw new Error(`Failed to rename: ${res.statusText}`);
}

/**
 * Usuwa plik/folder (soft delete)
 */
export async function deleteFile(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete: ${res.statusText}`);
}

/**
 * Upload pliku
 */
export async function uploadFile(
  folderPath: string,
  file: File
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('path', folderPath);
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to upload: ${res.statusText}`);
  return res.json();
}

/**
 * Pobiera zawartość pliku tekstowego
 */
export async function getFileContent(path: string): Promise<string> {
  const res = await fetch(`${API_BASE}/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Failed to get file: ${res.statusText}`);
  return res.text();
}

/**
 * Zwraca URL do pliku (dla obrazków, video itp.)
 */
export function getFileUrl(path: string): string {
  return `${API_BASE}/file?path=${encodeURIComponent(path)}`;
}

/**
 * Zapisuje zawartość pliku tekstowego
 */
export async function saveFile(path: string, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/save`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) throw new Error(`Failed to save file: ${res.statusText}`);
}

