import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ActionBar, type Action } from '@/components/ui/action-bar';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  icon: LucideIcon;
  /** Kolor ikony modułu (klasy text-*) — spójny z kaflami MainMenu. */
  iconColor?: string;
  actions?: Action[];
  maxVisibleActions?: number;
  /** Element przed ikoną/tytułem: wstecz/zamknij, toggle sidebara (Z4). */
  leading?: ReactNode;
};

/**
 * Wspólny nagłówek widoku: kolorowa ikona modułu + tytuł + ActionBar.
 * Padding/typografia ujednolicone wg audytu UI (pkt 4).
 */
export function PageHeader({
  title,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  actions,
  maxVisibleActions,
  leading,
}: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 border-b shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {leading}
        <Icon className={cn('h-5 w-5 shrink-0', iconColor)} />
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>
      {actions && actions.length > 0 && (
        <ActionBar actions={actions} maxVisible={maxVisibleActions} />
      )}
    </header>
  );
}
