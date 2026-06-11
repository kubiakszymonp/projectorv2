import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as playerApi from '@/api/player';
import { useSocketEvent, useSocketReconnect } from './useSocket';

// ========== QUERY KEYS ==========

export const playerKeys = {
  all: ['player'] as const,
  state: () => [...playerKeys.all, 'state'] as const,
};

// ========== QUERIES ==========

/**
 * Hook do pobierania aktualnego stanu ekranu
 * Aktualizacje przez WebSocket.
 * @param options.pollingFallback - włącz awaryjny polling (dla /display, gdy socket padnie)
 */
export function useScreenState(options?: { pollingFallback?: boolean }) {
  const queryClient = useQueryClient();

  // Listen to socket events for screen state changes
  useSocketEvent('screen:changed', () => {
    queryClient.invalidateQueries({ queryKey: playerKeys.state() });
  });

  // Po (ponownym) połączeniu socketu stan mógł się zmienić — wymuś odświeżenie
  useSocketReconnect(() => {
    queryClient.invalidateQueries({ queryKey: playerKeys.state() });
  });

  return useQuery({
    queryKey: playerKeys.state(),
    queryFn: playerApi.getScreenState,
    // Fallback polling dla ekranu publicznego — działa nawet gdy socket padnie
    refetchInterval: options?.pollingFallback ? 10000 : false,
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

/**
 * Hook do ustawiania kodu QR
 */
export function useSetQRCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: playerApi.setQRCode,
    onSuccess: (newState) => {
      queryClient.setQueryData(playerKeys.state(), newState);
    },
  });
}

