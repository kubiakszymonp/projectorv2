import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Music,
  Loader2,
  ChevronRight,
  Save,
  X,
  ListPlus,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTexts, useDomains, useCreateText, useUpdateText } from '@/hooks/useTexts';
import type { TextDoc } from '@/types/texts';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'edit';

export function SongCatalog() {
  // State
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<TextDoc | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editContent, setEditContent] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSongData, setNewSongData] = useState({ title: '', domain: 'songs' });
  const [previewSlide, setPreviewSlide] = useState<number | null>(null);

  // Queries
  const { data: songs, isLoading: isLoadingSongs } = useTexts({
    domain: selectedDomain ?? undefined,
    search: search || undefined,
  });
  const { data: domains } = useDomains();

  // Mutations
  const createText = useCreateText();
  const updateText = useUpdateText();

  // Computed
  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    return songs.sort((a, b) => a.meta.title.localeCompare(b.meta.title, 'pl'));
  }, [songs]);

  // Handlers
  const handleSelectSong = useCallback((song: TextDoc) => {
    setSelectedSong(song);
    setEditContent(song.contentRaw);
    setViewMode('edit');
    setPreviewSlide(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSong(null);
    setViewMode('list');
    setEditContent('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedSong) return;
    
    await updateText.mutateAsync({
      id: selectedSong.meta.id,
      data: { content: editContent },
    });
  }, [selectedSong, editContent, updateText]);

  const handleCreateSong = useCallback(async () => {
    if (!newSongData.title.trim()) return;
    
    const created = await createText.mutateAsync({
      domain: newSongData.domain,
      title: newSongData.title.trim(),
      content: '',
    });
    
    setIsCreateDialogOpen(false);
    setNewSongData({ title: '', domain: 'songs' });
    handleSelectSong(created);
  }, [newSongData, createText, handleSelectSong]);

  // Render helpers
  const renderDomainTabs = () => (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        onClick={() => setSelectedDomain(null)}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          selectedDomain === null
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Wszystkie
      </button>
      {domains?.map((domain) => (
        <button
          key={domain}
          onClick={() => setSelectedDomain(domain)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
            selectedDomain === domain
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {domain}
        </button>
      ))}
    </div>
  );

  const renderSongList = () => (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="p-4 space-y-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Katalog pieśni</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
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
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Domain tabs */}
        {domains && domains.length > 0 && renderDomainTabs()}
      </div>

      {/* Song list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {isLoadingSongs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSongs.length === 0 ? (
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
            filteredSongs.map((song) => (
              <Card
                key={song.meta.id}
                className="group cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => handleSelectSong(song)}
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
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderEditor = () => {
    if (!selectedSong) return null;

    const slides = editContent
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <X className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{selectedSong.meta.title}</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {selectedSong.meta.domain}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ListPlus className="h-4 w-4 mr-2" />
              Dodaj do scenariusza
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateText.isPending || editContent === selectedSong.contentRaw}
            >
              {updateText.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Zapisz
            </Button>
          </div>
        </div>

        {/* Editor content */}
        <div className="flex-1 flex min-h-0">
          {/* Text editor */}
          <div className="flex-1 flex flex-col min-w-0 border-r">
            <div className="p-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Treść pieśni</span>
              <span className="text-sm text-muted-foreground ml-2">
                (slajdy oddzielone pustą linią)
              </span>
            </div>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 resize-none rounded-none border-0 focus-visible:ring-0 p-4 text-base leading-relaxed"
              placeholder="Wpisz tekst pieśni...&#10;&#10;Oddziel slajdy pustą linią."
            />
          </div>

          {/* Slide preview */}
          <div className="w-80 flex flex-col bg-muted/20">
            <div className="p-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Podgląd slajdów</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({slides.length})
              </span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {slides.map((slide, index) => (
                  <Card
                    key={index}
                    className={cn(
                      'cursor-pointer transition-all hover:border-foreground/20',
                      previewSlide === index && 'ring-2 ring-emerald-500'
                    )}
                    onClick={() => setPreviewSlide(previewSlide === index ? null : index)}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Slajd {index + 1}
                        </span>
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-sm whitespace-pre-wrap line-clamp-4">
                        {slide}
                      </p>
                    </div>
                  </Card>
                ))}
                {slides.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Brak slajdów
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {viewMode === 'list' ? renderSongList() : renderEditor()}

      {/* Create dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nowa pieśń</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tytuł</label>
              <Input
                placeholder="Wpisz tytuł pieśni..."
                value={newSongData.title}
                onChange={(e) =>
                  setNewSongData((prev) => ({ ...prev, title: e.target.value }))
                }
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Domena</label>
              <select
                value={newSongData.domain}
                onChange={(e) =>
                  setNewSongData((prev) => ({ ...prev, domain: e.target.value }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {domains?.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
                {(!domains || domains.length === 0) && (
                  <option value="songs">songs</option>
                )}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleCreateSong}
              disabled={!newSongData.title.trim() || createText.isPending}
            >
              {createText.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Utwórz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

