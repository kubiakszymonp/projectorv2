import {
  Search,
  Plus,
  Music,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
}: SongListProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="p-4 space-y-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Katalog pieśni</h1>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nowa pieśń
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj pieśni..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

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
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
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
      </ScrollArea>
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
      <div className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Music className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{song.meta.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{song.meta.domain}</span>
            {song.meta.categories && song.meta.categories.length > 0 && (
              <>
                <span>•</span>
                <span className="truncate">
                  {song.meta.categories.join(', ')}
                </span>
              </>
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


