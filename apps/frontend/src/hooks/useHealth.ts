import { useQuery } from '@tanstack/react-query';
import * as healthApi from '@/api/health';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthApi.getHealth,
    refetchInterval: 30000, // odświeżaj status co 30 s
    staleTime: 10000,
  });
}
