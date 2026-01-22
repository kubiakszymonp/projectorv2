import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as playerApi from '@/api/player';
import type { ScreenState } from '@/types/player';

// ========== QUERY KEYS ==========

export const playerKeys = {
  all: ['player'] as const,
  state: () => [...playerKeys.all, 'state'] as const,
};

// ========== QUERIES ==========

/**
 * Hook do pobierania aktualnego stanu ekranu
 * @param pollingInterval - interwał pollingu w ms (domyślnie wyłączony)
 */
export function useScreenState(pollingInterval?: number) {
  return useQuery({
    queryKey: playerKeys.state(),
    queryFn: playerApi.getScreenState,
    refetchInterval: pollingInterval,
  });
}

// ========== MUTATIONS ==========

/**
 * Hook do czyszczenia ekranu
 */
export function useClearScreen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.clearScreen,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

/**
 * Hook do ustawiania tekstu
 */
export function useSetText() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.setText,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

/**
 * Hook do ustawiania medium
 */
export function useSetMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.setMedia,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

/**
 * Hook do uruchamiania scenariusza
 */
export function useSetScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.setScenario,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

/**
 * Hook do nawigacji slajdów
 */
export function useNavigateSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.navigateSlide,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

/**
 * Hook do nawigacji kroków scenariusza
 */
export function useNavigateStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.navigateStep,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

