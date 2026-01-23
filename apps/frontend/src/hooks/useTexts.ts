import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as textsApi from '@/api/texts';


// ========== QUERY KEYS ==========

export const textKeys = {
  all: ['texts'] as const,
  lists: () => [...textKeys.all, 'list'] as const,
  list: (filters?: { domain?: string; search?: string }) =>
    [...textKeys.lists(), filters] as const,
  details: () => [...textKeys.all, 'detail'] as const,
  detail: (id: string) => [...textKeys.details(), id] as const,
  domains: () => [...textKeys.all, 'domains'] as const,
};

// ========== QUERIES ==========

/**
 * Hook do pobierania wszystkich tekstów
 */
export function useTexts(filters?: { domain?: string; search?: string }) {
  return useQuery({
    queryKey: textKeys.list(filters),
    queryFn: async () => {
      const texts = await textsApi.getAllTexts();
      
      // Filtrowanie po stronie klienta
      let filtered = texts;
      
      if (filters?.domain) {
        filtered = filtered.filter((t) => t.meta.domain === filters.domain);
      }
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.meta.title.toLowerCase().includes(searchLower) ||
            t.meta.description?.toLowerCase().includes(searchLower) ||
            t.meta.categories?.some((c) => c.toLowerCase().includes(searchLower))
        );
      }
      
      return filtered;
    },
  });
}

/**
 * Hook do pobierania pojedynczego tekstu
 */
export function useText(id: string | null) {
  return useQuery({
    queryKey: textKeys.detail(id ?? ''),
    queryFn: () => textsApi.getTextById(id!),
    enabled: !!id,
  });
}

/**
 * Hook do pobierania domen
 */
export function useDomains() {
  return useQuery({
    queryKey: textKeys.domains(),
    queryFn: textsApi.getDomains,
  });
}

// ========== MUTATIONS ==========

/**
 * Hook do tworzenia tekstu
 */
export function useCreateText() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: textsApi.createText,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: textKeys.lists() });
    },
  });
}

/**
 * Hook do aktualizacji tekstu
 */
export function useUpdateText() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: textsApi.UpdateTextData }) =>
      textsApi.updateText(id, data),
    onSuccess: (updatedText) => {
      queryClient.invalidateQueries({ queryKey: textKeys.lists() });
      queryClient.setQueryData(textKeys.detail(updatedText.meta.id), updatedText);
    },
  });
}

/**
 * Hook do usuwania tekstu
 */
export function useDeleteText() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: textsApi.deleteText,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: textKeys.lists() });
    },
  });
}

/**
 * Hook do tworzenia domeny
 */
export function useCreateDomain() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: textsApi.createDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: textKeys.domains() });
    },
  });
}

/**
 * Hook do przeładowania tekstów
 */
export function useReloadTexts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: textsApi.reloadTexts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: textKeys.all });
    },
  });
}

