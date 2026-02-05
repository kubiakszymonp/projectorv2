import { X, Save, Trash2, Monitor, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ScenarioDoc } from '@/types/scenarios';

type ScenarioEditorHeaderProps = {
  scenario: ScenarioDoc;
  stepsCount: number;
  isCurrentlyProjecting: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  onDelete: () => void;
  onProjectToScreen: () => void;
  canProject: boolean;
  isMobile?: boolean;
};

export function ScenarioEditorHeader({
  scenario,
  stepsCount,
  isCurrentlyProjecting,
  hasChanges,
  isSaving,
  onBack,
  onSave,
  onDelete,
  onProjectToScreen,
  canProject,
  isMobile = false,
}: ScenarioEditorHeaderProps) {
  if (isMobile) {
    return (
      <div className="px-3 py-2.5 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
            <X className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">{scenario.meta.title}</h1>
            <p className="text-xs text-muted-foreground">
              {stepsCount} kroków
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant={isCurrentlyProjecting ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={onProjectToScreen}
            disabled={!canProject}
            title="Rzutuj na ekran"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Usuń"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-8 w-8"
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            title="Zapisz"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="px-4 py-3 border-b flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">{scenario.meta.title}</h1>
          <p className="text-sm text-muted-foreground">
            {stepsCount} kroków
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={isCurrentlyProjecting ? 'default' : 'outline'}
          size="icon"
          onClick={onProjectToScreen}
          disabled={!canProject}
          title="Rzutuj na ekran"
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
          title="Usuń"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          title="Zapisz"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}


