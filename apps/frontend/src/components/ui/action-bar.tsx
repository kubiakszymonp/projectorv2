import { MoreVertical, Loader2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type Action = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  /** Akcja destrukcyjna (Usuń) — zawsze ląduje w menu ⋯, na dole, czerwona (Z3). */
  destructive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Pokaż label także na mobile. Domyślnie label jest ukryty < sm (Z2). */
  alwaysLabel?: boolean;
};

type ActionBarProps = {
  actions: Action[];
  /** Maks. liczba akcji jako widoczne przyciski; reszta → menu ⋯ (domyślnie 3, Z2). */
  maxVisible?: number;
  className?: string;
};

/**
 * Wspólny pasek akcji nagłówka/edytora. Renderuje widoczne przyciski wg reguł
 * Z1–Z6 z audytu UI i pakuje nadmiar (oraz akcje destrukcyjne) do menu ⋯.
 */
export function ActionBar({ actions, maxVisible = 3, className }: ActionBarProps) {
  const nonDestructive = actions.filter((a) => !a.destructive);
  const destructive = actions.filter((a) => a.destructive);

  let visible: Action[];
  let overflow: Action[];

  if (actions.length <= maxVisible && destructive.length === 0) {
    // ≤ maxVisible akcji, brak destrukcyjnych → wszystkie widoczne (Z2)
    visible = actions;
    overflow = [];
  } else {
    // primary + jedna sekundarna widoczne; reszta + destrukcyjne → menu (Z2/Z3)
    visible = nonDestructive.slice(0, 2);
    overflow = [...nonDestructive.slice(2), ...destructive];
  }

  const overflowNonDestructive = overflow.filter((a) => !a.destructive);
  const overflowDestructive = overflow.filter((a) => a.destructive);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {visible.map((a) => {
        const Icon = a.icon;
        return (
          <Button
            key={a.key}
            size="sm"
            variant={a.variant ?? 'outline'}
            onClick={a.onClick}
            disabled={a.disabled || a.loading}
            className="gap-1.5"
            title={a.label}
            aria-label={a.label}
          >
            {a.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
            <span className={a.alwaysLabel ? '' : 'hidden sm:inline'}>{a.label}</span>
          </Button>
        );
      })}

      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="px-2"
              title="Więcej"
              aria-label="Więcej akcji"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflowNonDestructive.map((a) => {
              const Icon = a.icon;
              return (
                <DropdownMenuItem
                  key={a.key}
                  onClick={a.onClick}
                  disabled={a.disabled || a.loading}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {a.label}
                </DropdownMenuItem>
              );
            })}
            {overflowDestructive.length > 0 && overflowNonDestructive.length > 0 && (
              <DropdownMenuSeparator />
            )}
            {overflowDestructive.map((a) => {
              const Icon = a.icon;
              return (
                <DropdownMenuItem
                  key={a.key}
                  onClick={a.onClick}
                  disabled={a.disabled || a.loading}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Icon className="h-4 w-4" />
                  {a.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
