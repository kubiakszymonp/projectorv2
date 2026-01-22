import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as playerApi from '@/api/player';
import { useSocketEvent } from './useSocket';

// ========== QUERY KEYS ==========

export const playerKeys = {
  all: ['player'] as const,
  state: () => [...playerKeys.all, 'state'] as const,
};

// ========== QUERIES ==========

/**
 * Hook do pobierania aktualnego stanu ekranu
 * Aktualizacje przez WebSocket, bez pollingu
 */
export function useScreenState() {
  const queryClient = useQueryClient();

  // Listen to socket events for screen state changes
  useSocketEvent('screen:changed', () => {
    queryClient.invalidateQueries({ queryKey: playerKeys.state() });
  });

  return useQuery({
    queryKey: playerKeys.state(),
    queryFn: playerApi.getScreenState,
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

/**
 * Hook do przełączania widoczności
 */
export function useToggleVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.toggleVisibility,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

/**
 * Hook do ustawiania widoczności
 */
export function useSetVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.setVisibility,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

