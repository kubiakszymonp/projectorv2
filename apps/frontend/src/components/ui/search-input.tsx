import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/**
 * Wspólne pole wyszukiwania: ikona Search + Input z wcięciem (pl-9).
 * Wzorzec wydzielony z SongList/ScenarioList — używany we wszystkich widokach.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Szukaj...',
  className,
  autoFocus,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="pl-9"
      />
    </div>
  );
}
