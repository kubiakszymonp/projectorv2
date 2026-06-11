import { X, Save, Trash2, Monitor, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionBar, type Action } from '@/components/ui/action-bar';
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
  onDuplicate: () => void;
  onProjectToScreen: () => void;
  canProject: boolean;
  /** Zachowane dla zgodności wywołań — układ jest teraz wspólny dla mobile/desktop. */
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
  onDuplicate,
  onProjectToScreen,
  canProject,
}: ScenarioEditorHeaderProps) {
  // Z2: widoczne Zapisz + Rzutuj; Duplikuj i Usuń → menu ⋯ (Usuń destrukcyjny, Z3)
  const actions: Action[] = [
    {
      key: 'save',
      label: 'Zapisz',
      icon: Save,
      onClick: onSave,
      variant: 'default',
      disabled: !hasChanges || isSaving,
      loading: isSaving,
      alwaysLabel: true,
    },
    {
      key: 'project',
      label: 'Rzutuj',
      icon: Monitor,
      onClick: onProjectToScreen,
      variant: isCurrentlyProjecting ? 'default' : 'outline',
      disabled: !canProject,
    },
    {
      key: 'duplicate',
      label: 'Duplikuj',
      icon: Copy,
      onClick: onDuplicate,
      variant: 'outline',
    },
    {
      key: 'delete',
      label: 'Usuń',
      icon: Trash2,
      onClick: onDelete,
      destructive: true,
    },
  ];

  return (
    <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={onBack}
          title="Zamknij"
          aria-label="Zamknij"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate">{scenario.meta.title}</h1>
          <p className="text-xs text-muted-foreground">{stepsCount} kroków</p>
        </div>
      </div>
      <ActionBar actions={actions} />
    </div>
  );
}
