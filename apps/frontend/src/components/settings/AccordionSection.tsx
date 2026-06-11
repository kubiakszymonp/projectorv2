import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown, type LucideIcon } from 'lucide-react';

type AccordionSectionProps = {
  icon: LucideIcon;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/** Pojedyncza sekcja akordeonu w Ustawieniach (3 takie same kopie → 1 komponent). */
export function AccordionSection({
  icon: Icon,
  title,
  open,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <div className="border-b">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-4 bg-muted/10">{children}</div>}
    </div>
  );
}
