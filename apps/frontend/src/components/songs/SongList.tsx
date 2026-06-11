import {
  Plus,
  Music,
  Loader2,
  ChevronRight,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import type { Action } from '@/components/ui/action-bar';
import { SearchInput } from '@/components/ui/search-input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TextDoc } from '@/types/texts';
import { cn } from '@/lib/utils';

interface SongListProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedDomain: string | null;
  onDomainChange: (domain: string | null) => void;
  domains: string[] | undefined;
  songs: TextDoc[];
  isLoading: boolean;
  onSelectSong: (song: TextDoc) => void;
  onCreateNew: () => void;
  onImport?: () => void;
  isImporting?: boolean;
  onReload?: () => void;
  isReloading?: boolean;
}

export function SongList({
  search,
  onSearchChange,
  selectedDomain,
  onDomainChange,
  domains,
  songs,
  isLoading,
  onSelectSong,
  onCreateNew,
  onImport,
  isImporting,
  onReload,
  isReloading,
}: SongListProps) {
  const actions: Action[] = [];
  if (onReload) {
    actions.push({
      key: 'refresh',
      label: 'Odśwież',
      icon: RefreshCw,
      onClick: onReload,
      variant: 'outline',
      loading: isReloading,
    });
  }
  if (onImport) {
    actions.push({
      key: 'import',
      label: 'Importuj',
      icon: Upload,
      onClick: onImport,
      variant: 'outline',
      loading: isImporting,
    });
  }
  actions.push({
    key: 'new',
    label: 'Nowa pieśń',
    icon: Plus,
    onClick: onCreateNew,
    variant: 'default',
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title="Katalog pieśni"
        icon={Music}
        iconColor="text-emerald-400"
        actions={actions}
      />

      {/* Search + filtry */}
      <div className="p-3 sm:p-4 space-y-4 border-b">
        <SearchInput value={search} onChange={onSearchChange} placeholder="Szukaj pieśni..." />

        {/* Domain tabs */}
        {domains && domains.length > 0 && (
          <DomainTabs
            domains={domains}
            selected={selectedDomain}
            onSelect={onDomainChange}
          />
        )}
      </div>

      {/* Song list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Brak pieśni</p>
              <p className="text-sm">
                {search
                  ? 'Nie znaleziono pieśni pasujących do wyszukiwania'
                  : 'Dodaj pierwszą pieśń, klikając "Nowa pieśń"'}
              </p>
            </div>
          ) : (
            songs.map((song) => (
              <SongCard
                key={song.meta.id}
                song={song}
                onClick={() => onSelectSong(song)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface DomainTabsProps {
  domains: string[];
  selected: string | null;
  onSelect: (domain: string | null) => void;
}

function DomainTabs({ domains, selected, onSelect }: DomainTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          selected === null
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Wszystkie
      </button>
      {domains.map((domain) => (
        <button
          key={domain}
          onClick={() => onSelect(domain)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
            selected === domain
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {domain}
        </button>
      ))}
    </div>
  );
}

interface SongCardProps {
  song: TextDoc;
  onClick: () => void;
}

function SongCard({ song, onClick }: SongCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:border-foreground/20 transition-colors"
      onClick={onClick}
    >
      <div className="p-3 sm:p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Music className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{song.meta.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{song.meta.domain}</span>
            {song.meta.categories && song.meta.categories.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {song.meta.categories.slice(0, 4).map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {song.slides.length} slajdów
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Card>
  );
}


