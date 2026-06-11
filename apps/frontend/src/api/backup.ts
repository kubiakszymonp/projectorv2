/**
 * Pobiera kopię zapasową (ZIP) — wymusza pobranie pliku w przeglądarce.
 */
export function downloadBackup(): void {
  const a = document.createElement('a');
  a.href = '/api/backup';
  a.download = '';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Przywraca kopię zapasową z pliku ZIP.
 */
export async function importBackup(file: File): Promise<{ success: boolean }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/backup/import', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to import backup: ${res.statusText}`);
  return res.json();
}
