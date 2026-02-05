import { useState, useMemo, useCallback } from 'react';
import { Search, ListOrdered, Loader2, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useScenarios, useRecentScenarios, useAddStepToScenario } from '@/hooks/useScenarios';
import type { ScenarioDoc, ScenarioStep } from '@/types/scenarios';
import { cn } from '@/lib/utils';

type AddToScenarioModalProps = {
  open: boolean;
  onClose: () => void;
  step: ScenarioStep | null;
  itemTitle?: string;
};

export function AddToScenarioModal({
  open,
  onClose,
  step,
  itemTitle,
}: AddToScenarioModalProps) {
  const [search, setSearch] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Queries
  const { data: recentScenarios, isLoading: isLoadingRecent } = useRecentScenarios(5);
  const { data: allScenarios, isLoading: isLoadingAll } = useScenarios({
    search: search || undefined,
  });

  // Mutation
  const addStep = useAddStepToScenario();

  // Computed - show recent when no search, filtered results when searching
  const displayedScenarios = useMemo(() => {
    if (search.trim()) {
      return allScenarios ?? [];
    }
    return recentScenarios ?? [];
  }, [search, allScenarios, recentScenarios]);

  const isLoading = search.trim() ? isLoadingAll : isLoadingRecent;

  // Handlers
  const handleSelect = useCallback((scenarioId: string) => {
    setSelectedScenarioId(scenarioId === selectedScenarioId ? null : scenarioId);
  }, [selectedScenarioId]);

  const handleAdd = useCallback(async () => {
    if (!selectedScenarioId || !step) return;

    await addStep.mutateAsync({
      scenarioId: selectedScenarioId,
      step,
    });

    // Reset and close
    setSelectedScenarioId(null);
    setSearch('');
    onClose();
  }, [selectedScenarioId, step, addStep, onClose]);

  const handleClose = useCallback(() => {
    setSelectedScenarioId(null);
    setSearch('');
    onClose();
  }, [onClose]);

  const selectedScenario = displayedScenarios.find(
    (s) => s.meta.id === selectedScenarioId
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj do scenariusza</DialogTitle>
          {itemTitle && (
            <DialogDescription>
              Dodajesz: <span className="font-medium text-foreground">{itemTitle}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj scenariuszy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Label */}
          <div className="text-xs text-muted-foreground font-medium">
            {search.trim() ? 'Wyniki wyszukiwania' : 'Ostatnie scenariusze'}
          </div>

          {/* Scenario list */}
          <ScrollArea className="h-64 -mx-2">
            <div className="px-2 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : displayedScenarios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListOrdered className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {search.trim()
                      ? 'Nie znaleziono scenariuszy'
                      : 'Brak scenariuszy'}
                  </p>
                </div>
              ) : (
                displayedScenarios.map((scenario) => (
                  <ScenarioOption
                    key={scenario.meta.id}
                    scenario={scenario}
                    isSelected={selectedScenarioId === scenario.meta.id}
                    onSelect={() => handleSelect(scenario.meta.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="sm:flex-1">
            Anuluj
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedScenarioId || addStep.isPending}
            className="sm:flex-1"
          >
            {addStep.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {selectedScenario
              ? `Dodaj do "${selectedScenario.meta.title}"`
              : 'Wybierz scenariusz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========== SCENARIO OPTION COMPONENT ==========

type ScenarioOptionProps = {
  scenario: ScenarioDoc;
  isSelected: boolean;
  onSelect: () => void;
};

function ScenarioOption({ scenario, isSelected, onSelect }: ScenarioOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
        isSelected
          ? 'bg-primary/10 ring-2 ring-primary'
          : 'hover:bg-muted/50'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-cyan-500/10'
        )}
      >
        {isSelected ? (
          <Check className="h-4 w-4" />
        ) : (
          <ListOrdered className="h-4 w-4 text-cyan-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{scenario.meta.title}</p>
        <p className="text-xs text-muted-foreground">
          {scenario.steps.length} kroków
        </p>
      </div>
    </button>
  );
}





