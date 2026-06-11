import { useEffect, useState, useCallback } from 'react';
import { RotateCcw, Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { listTrash, restoreTrash, type TrashEntry } from '@/api/files';

interface TrashDialogProps {
  open: boolean;
  onClose: () => void;
  onRestored?: () => void;
}

function formatDeletedAt(raw: string): string {
  // raw: 2026-06-11T10-30-00-000Z → ISO
  const iso = raw.replace(
    /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
    '$1T$2:$3:$4.$5Z',
  );
  const d = new Date(iso);
  return isNaN(d.getTime()) ? raw : d.toLocaleString('pl-PL');
}

export function TrashDialog({ open, onClose, onRestored }: TrashDialogProps) {
  const [entries, setEntries] = useState<TrashEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringName, setRestoringName] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setEntries(await listTrash());
    } catch {
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const handleRestore = async (name: string) => {
    setRestoringName(name);
    try {
      await restoreTrash(name);
      await load();
      onRestored?.();
    } finally {
      setRestoringName(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Kosz
          </DialogTitle>
          <DialogDescription>
            Usunięte pliki. Starsze niż 30 dni są czyszczone automatycznie.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-auto -mx-2 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Kosz jest pusty.
            </p>
          ) : (
            <ul className="space-y-1">
              {entries.map((entry) => (
                <li
                  key={entry.name}
                  className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.originalPath} · {formatDeletedAt(entry.deletedAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(entry.name)}
                    disabled={restoringName === entry.name}
                  >
                    {restoringName === entry.name ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">Przywróć</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
