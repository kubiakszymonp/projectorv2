import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as scenariosApi from '@/api/scenarios';
import type { ScenarioDoc, ScenarioStep } from '@/types/scenarios';

// ========== QUERY KEYS ==========

export const scenarioKeys = {
  all: ['scenarios'] as const,
  lists: () => [...scenarioKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) => [...scenarioKeys.lists(), filters] as const,
  details: () => [...scenarioKeys.all, 'detail'] as const,
  detail: (id: string) => [...scenarioKeys.details(), id] as const,
};

// ========== QUERIES ==========

/**
 * Hook do pobierania wszystkich scenariuszy
 */
export function useScenarios(filters?: { search?: string }) {
  return useQuery({
    queryKey: scenarioKeys.list(filters),
    queryFn: async () => {
      const scenarios = await scenariosApi.getAllScenarios();

      // Filtrowanie po stronie klienta
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return scenarios.filter(
          (s) =>
            s.meta.title.toLowerCase().includes(searchLower) ||
            s.meta.description?.toLowerCase().includes(searchLower)
        );
      }

      return scenarios;
    },
  });
}

/**
 * Hook do pobierania pojedynczego scenariusza
 */
export function useScenario(id: string | null) {
  return useQuery({
    queryKey: scenarioKeys.detail(id ?? ''),
    queryFn: () => scenariosApi.getScenarioById(id!),
    enabled: !!id,
  });
}

/**
 * Hook do pobierania ostatnich scenariuszy (posortowanych po dacie modyfikacji)
 */
export function useRecentScenarios(limit: number = 5) {
  return useQuery({
    queryKey: [...scenarioKeys.lists(), 'recent', limit] as const,
    queryFn: async () => {
      const scenarios = await scenariosApi.getAllScenarios();
      // Sortuj po ID (ULID zawiera timestamp) malejąco
      return scenarios
        .sort((a, b) => b.meta.id.localeCompare(a.meta.id))
        .slice(0, limit);
    },
  });
}

// ========== MUTATIONS ==========

/**
 * Hook do tworzenia scenariusza
 */
export function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scenariosApi.createScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioKeys.lists() });
    },
  });
}

/**
 * Hook do aktualizacji scenariusza
 */
export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: scenariosApi.UpdateScenarioData }) =>
      scenariosApi.updateScenario(id, data),
    onSuccess: (updatedScenario) => {
      queryClient.invalidateQueries({ queryKey: scenarioKeys.lists() });
      queryClient.setQueryData(scenarioKeys.detail(updatedScenario.meta.id), updatedScenario);
    },
  });
}

/**
 * Hook do usuwania scenariusza
 */
export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scenariosApi.deleteScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioKeys.lists() });
    },
  });
}

/**
 * Hook do dodawania kroku do scenariusza
 */
export function useAddStepToScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scenarioId, step }: { scenarioId: string; step: ScenarioStep }) =>
      scenariosApi.addStepToScenario(scenarioId, step),
    onSuccess: (updatedScenario) => {
      queryClient.invalidateQueries({ queryKey: scenarioKeys.lists() });
      queryClient.setQueryData(scenarioKeys.detail(updatedScenario.meta.id), updatedScenario);
    },
  });
}

/**
 * Hook do usuwania kroku ze scenariusza
 */
export function useRemoveStepFromScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scenarioId, stepIndex }: { scenarioId: string; stepIndex: number }) =>
      scenariosApi.removeStepFromScenario(scenarioId, stepIndex),
    onSuccess: (updatedScenario) => {
      queryClient.invalidateQueries({ queryKey: scenarioKeys.lists() });
      queryClient.setQueryData(scenarioKeys.detail(updatedScenario.meta.id), updatedScenario);
    },
  });
}

/**
 * Hook do zmiany kolejności kroków
 */
export function useReorderScenarioSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scenarioId,
      fromIndex,
      toIndex,
    }: {
      scenarioId: string;
      fromIndex: number;
      toIndex: number;
    }) => scenariosApi.reorderScenarioSteps(scenarioId, fromIndex, toIndex),
    onSuccess: (updatedScenario) => {
      queryClient.invalidateQueries({ queryKey: scenarioKeys.lists() });
      queryClient.setQueryData(scenarioKeys.detail(updatedScenario.meta.id), updatedScenario);
    },
  });
}



