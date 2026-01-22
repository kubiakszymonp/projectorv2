import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsApi from '@/api/settings';
import type { ProjectorSettings } from '@/types/settings';

// ========== QUERY KEYS ==========

export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
};

// ========== QUERIES ==========

/**
 * Hook do pobierania ustawień
 * @param pollingInterval - interwał pollingu w ms (opcjonalny)
 */
export function useSettings(pollingInterval?: number) {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: settingsApi.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: pollingInterval,
  });
}

// ========== MUTATIONS ==========

/**
 * Hook do aktualizacji ustawień (częściowa)
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.detail(), updatedSettings);
    },
  });
}

/**
 * Hook do zastąpienia wszystkich ustawień
 */
export function useReplaceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.replaceSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.detail(), updatedSettings);
    },
  });
}

/**
 * Hook do resetowania ustawień
 */
export function useResetSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.resetSettings,
    onSuccess: (defaultSettings) => {
      queryClient.setQueryData(settingsKeys.detail(), defaultSettings);
    },
  });
}

