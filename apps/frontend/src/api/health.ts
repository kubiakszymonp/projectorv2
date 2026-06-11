export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
  texts: number;
  diskFreeBytes: number | null;
  diskTotalBytes: number | null;
  timestamp: string;
}

/**
 * Pobiera status systemu (uptime, liczba tekstów, miejsce na dysku)
 */
export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error(`Failed to get health: ${res.statusText}`);
  return res.json();
}
