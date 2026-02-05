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
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">Konfiguracja</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isResetting}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resetuj
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={cn(
            'min-w-[120px]',
            saveSuccess && 'bg-green-600 hover:bg-green-600'
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Zapisuję...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Zapisano
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Zapisz{isDirty && ' *'}
            </>
          )}
        </Button>
      </div>
    </header>
  );
}


