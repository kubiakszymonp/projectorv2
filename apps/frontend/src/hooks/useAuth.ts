import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth';

const authKey = ['auth', 'status'] as const;

export function useAuthStatus() {
  return useQuery({
    queryKey: authKey,
    queryFn: authApi.getAuthStatus,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKey }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKey }),
  });
}

export function useSetPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.setPin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKey }),
  });
}
