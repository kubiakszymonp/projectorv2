import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocketEvent } from './useSocket';

async function getStatus(): Promise<{ displays: number }> {
  const res = await fetch('/api/notifications/status');
  if (!res.ok) throw new Error('Failed to get notifications status');
  return res.json();
}

/**
 * Liczba połączonych ekranów (/display). Odświeżane przez event clients:changed.
 */
export function useScreenConnections() {
  const queryClient = useQueryClient();

  useSocketEvent('clients:changed', () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', 'status'] });
  });

  return useQuery({
    queryKey: ['notifications', 'status'],
    queryFn: getStatus,
    refetchInterval: 30000,
  });
}
