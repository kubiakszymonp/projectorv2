import { Plus, ListOrdered, Loader2, ChevronRight, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { ScenarioDoc } from '@/types/scenarios';

type ScenarioListProps = {
  scenarios: ScenarioDoc[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectScenario: (scenario: ScenarioDoc) => void;
  onCreateScenario: () => void;
  onReload: () => void;
  isReloading: boolean;
};

export function ScenarioList({
  scenarios,
  isLoading,
  search,
  onSearchChange,
  onSelectScenario,
  onCreateScenario,
  onReload,
  isReloading,
}: ScenarioListProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="p-3 sm:p-4 space-y-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Scenariusze</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onReload} disabled={isReloading} title="Odśwież">
              <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="icon" onClick={onCreateScenario} title="Nowy scenariusz">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <SearchInput value={search} onChange={onSearchChange} placeholder="Szukaj scenariuszy..." />
      </div>

      {/* Scenario list */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListOrdered className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Brak scenariuszy</p>
              <p className="text-sm">
                {search
                  ? 'Nie znaleziono scenariuszy pasujących do wyszukiwania'
                  : 'Dodaj pierwszy scenariusz, klikając "Nowy scenariusz"'}
              </p>
            </div>
          ) : (
            scenarios.map((scenario) => (
              <Card
                key={scenario.meta.id}
                className="group cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => onSelectScenario(scenario)}
              >
                <div className="p-3 sm:p-4 flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <ListOrdered className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" title={scenario.meta.title}>
                      {isMobile && scenario.meta.title.length > 50
                        ? `${scenario.meta.title.substring(0, 50)}...`
                        : scenario.meta.title}
                    </h3>
                    {scenario.meta.description && (
                      <p className="text-sm text-muted-foreground truncate" title={scenario.meta.description}>
                        {isMobile && scenario.meta.description.length > 50
                          ? `${scenario.meta.description.substring(0, 50)}...`
                          : scenario.meta.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {scenario.meta.date && (
                      <span className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {scenario.meta.date}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {scenario.steps.length} kroków
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

