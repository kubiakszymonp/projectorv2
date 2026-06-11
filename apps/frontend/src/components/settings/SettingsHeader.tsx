import { Save, RotateCcw, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SettingsHeaderProps = {
  isDirty: boolean;
  saveSuccess: boolean;
  isSaving: boolean;
  isResetting: boolean;
  onSave: () => void;
  onReset: () => void;
};

export function SettingsHeader({
  isDirty,
  saveSuccess,
  isSaving,
  isResetting,
  onSave,
  onReset,
}: SettingsHeaderProps) {
  return (
    <header className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b gap-2 flex-wrap">
      <h1 className="text-lg font-semibold">Konfiguracja</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isResetting}
          className="gap-1.5"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Resetuj</span>
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={cn(
            'gap-1.5 min-w-[80px] sm:min-w-[120px]',
            saveSuccess && 'bg-green-600 hover:bg-green-600'
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Zapisuję...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Zapisano</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Zapisz{isDirty && ' *'}
            </>
          )}
        </Button>
      </div>
    </header>
  );
}


