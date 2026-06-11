import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTexts } from '@/hooks/useTexts';
import { useSetText, useSetVisibility } from '@/hooks/usePlayer';
import { createTextReference } from '@/utils/textReference';

interface QuickSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Szybkie wyszukanie i wyświetlenie pieśni z panelu sterowania (Ctrl+K).
 * Wybranie pozycji od razu rzutuje ją na ekran.
 */
export function QuickSearchDialog({ open, onClose }: QuickSearchDialogProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: texts } = useTexts();
  const setText = useSetText();
  const setVisibility = useSetVisibility();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!texts) return [];
    const q = query.trim().toLowerCase();
    const list = q
      ? texts.filter(
          (t) =>
            t.meta.title.toLowerCase().includes(q) ||
            t.meta.categories?.some((c) => c.toLowerCase().includes(q)),
        )
      : texts;
    return list.slice(0, 30);
  }, [texts, query]);

  const handleSelect = async (textRef: string) => {
    await setText.mutateAsync({ textRef });
    await setVisibility.mutateAsync(true); // natychmiast pokaż na ekranie
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="sr-only">Szybkie wyszukiwanie pieśni</DialogTitle>
          <div className="flex items-center gap-2 border-b pb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj pieśni i wyświetl…"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-auto px-2 pb-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Brak wyników
            </p>
          ) : (
            <ul>
              {results.map((t) => (
                <li key={t.meta.id}>
                  <button
                    onClick={() => handleSelect(createTextReference(t))}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-muted/60"
                  >
                    <Music className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {t.meta.title}
                      </span>
                      <span className="block text-xs text-muted-foreground capitalize truncate">
                        {t.meta.domain}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
