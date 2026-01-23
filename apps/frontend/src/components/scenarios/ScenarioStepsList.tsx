import { ListOrdered, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepItem } from './StepItem';
import type { ScenarioStep } from '@/types/scenarios';

type ScenarioStepsListProps = {
  steps: ScenarioStep[];
  selectedStepIndex: number | null;
  dragIndex: number | null;
  dragOverIndex: number | null;
  onSelectStep: (index: number) => void;
  onDeleteStep: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onGoToSongs: () => void;
};

export function ScenarioStepsList({
  steps,
  selectedStepIndex,
  dragIndex,
  dragOverIndex,
  onSelectStep,
  onDeleteStep,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onGoToSongs,
}: ScenarioStepsListProps) {
  return (
    <>
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
        <span className="text-sm font-medium">
          Kroki ({steps.length})
        </span>
        <Button size="icon" variant="outline" onClick={onGoToSongs} title="Dodaj z katalogu">
          <Music className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {steps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListOrdered className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Brak kroków</p>
              <p className="text-xs mt-1">
                Przejdź do katalogu pieśni i dodaj teksty
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onGoToSongs}
              >
                <Music className="h-4 w-4 mr-2" />
                Przejdź do katalogu
              </Button>
            </div>
          ) : (
            steps.map((step, index) => (
              <StepItem
                key={index}
                step={step}
                index={index}
                isSelected={selectedStepIndex === index}
                isDragging={dragIndex === index}
                isDragOver={dragOverIndex === index}
                onSelect={() => onSelectStep(index)}
                onDelete={() => onDeleteStep(index)}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
}

