import { useState, useMemo, useCallback, useEffect } from 'react';
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
  FileText,
  Tags,
  ChevronDown,
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
import { AddToScenarioModal } from '@/components/scenarios/AddToScenarioModal';
import { useTexts, useDomains, useCreateText, useUpdateText } from '@/hooks/useTexts';
import type { TextDoc } from '@/types/texts';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'edit';
type EditorTab = 'content' | 'metadata';

/**
 * Tworzy referencję do tekstu dla scenariusza
 * Format: domain/slug__id (np. songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P)
 */
function createTextReference(song: TextDoc): string {
  const slug = song.meta.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${song.meta.domain}/${slug}__${song.meta.id}`;
}

export function SongCatalog() {
  // State
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<TextDoc | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editorTab, setEditorTab] = useState<EditorTab>('content');
  const [editContent, setEditContent] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSongData, setNewSongData] = useState({ title: '', domain: 'songs' });
  const [previewSlide, setPreviewSlide] = useState<number | null>(null);
  const [isAddToScenarioOpen, setIsAddToScenarioOpen] = useState(false);

  // Metadata editing state
  const [editedMeta, setEditedMeta] = useState<{
    title: string;
    description: string;
    categories: string[];
    domain: string;
  } | null>(null);
  const [newCategory, setNewCategory] = useState('');

  // Queries
  const { data: songs, isLoading: isLoadingSongs } = useTexts({
    domain: selectedDomain ?? undefined,
    search: search || undefined,
  });
  const { data: domains } = useDomains();

  // Mutations
  const createText = useCreateText();
  const updateText = useUpdateText();

  // All categories for suggestions
  const allCategories = useMemo(() => {
    if (!songs) return [];
    const cats = new Set<string>();
    songs.forEach((song) => {
      song.meta.categories?.forEach((c) => cats.add(c));
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [songs]);

  // Computed
  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    return songs.sort((a, b) => a.meta.title.localeCompare(b.meta.title, 'pl'));
  }, [songs]);

  // Check for changes
  const hasContentChanges = selectedSong && editContent !== selectedSong.contentRaw;
  const hasMetaChanges = useMemo(() => {
    if (!selectedSong || !editedMeta) return false;
    return (
      editedMeta.title !== selectedSong.meta.title ||
      editedMeta.description !== (selectedSong.meta.description || '') ||
      editedMeta.domain !== selectedSong.meta.domain ||
      JSON.stringify(editedMeta.categories.sort()) !==
        JSON.stringify([...(selectedSong.meta.categories || [])].sort())
    );
  }, [selectedSong, editedMeta]);

  const hasChanges = hasContentChanges || hasMetaChanges;

  // Effect to sync metadata state with selected song
  useEffect(() => {
    if (selectedSong) {
      setEditedMeta({
        title: selectedSong.meta.title,
        description: selectedSong.meta.description || '',
        categories: selectedSong.meta.categories || [],
        domain: selectedSong.meta.domain,
      });
    } else {
      setEditedMeta(null);
    }
  }, [selectedSong]);

  // Handlers
  const handleSelectSong = useCallback((song: TextDoc) => {
    setSelectedSong(song);
    setEditContent(song.contentRaw);
    setViewMode('edit');
    setEditorTab('content');
    setPreviewSlide(null);
    setNewCategory('');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSong(null);
    setViewMode('list');
    setEditContent('');
    setEditedMeta(null);
    setEditorTab('content');
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedSong || !editedMeta) return;

    const updated = await updateText.mutateAsync({
      id: selectedSong.meta.id,
      data: {
        content: editContent,
        title: editedMeta.title,
        description: editedMeta.description || undefined,
        categories: editedMeta.categories,
        domain: editedMeta.domain,
      },
    });

    setSelectedSong(updated);
    setEditContent(updated.contentRaw);
  }, [selectedSong, editContent, editedMeta, updateText]);

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

  const handleAddCategory = useCallback(() => {
    if (!editedMeta || !newCategory.trim()) return;
    const cat = newCategory.trim().toLowerCase();
    if (editedMeta.categories.includes(cat)) return;

    setEditedMeta((prev) =>
      prev ? { ...prev, categories: [...prev.categories, cat] } : null
    );
    setNewCategory('');
  }, [editedMeta, newCategory]);

  const handleRemoveCategory = useCallback((category: string) => {
    setEditedMeta((prev) =>
      prev
        ? { ...prev, categories: prev.categories.filter((c) => c !== category) }
        : null
    );
  }, []);

  // Render helpers
  const renderDomainTabs = () => (
    <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg">
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

  const renderEditorTabs = () => (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        onClick={() => setEditorTab('content')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          editorTab === 'content'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileText className="h-4 w-4" />
        Treść
      </button>
      <button
        onClick={() => setEditorTab('metadata')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          editorTab === 'metadata'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Tags className="h-4 w-4" />
        Metadane
      </button>
    </div>
  );

  const renderCategorySuggestions = () => {
    if (!newCategory.trim() || !allCategories.length) return null;

    const suggestions = allCategories.filter(
      (c) =>
        c.toLowerCase().includes(newCategory.toLowerCase()) &&
        !editedMeta?.categories.includes(c)
    );

    if (!suggestions.length) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-32 overflow-auto">
        {suggestions.map((cat) => (
          <button
            key={cat}
            type="button"
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted transition-colors"
            onClick={() => {
              if (!editedMeta) return;
              setEditedMeta((prev) =>
                prev ? { ...prev, categories: [...prev.categories, cat] } : null
              );
              setNewCategory('');
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  };

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

  const renderContentEditor = () => {
    const slides = editContent
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    return (
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
    );
  };

  const renderMetadataEditor = () => {
    if (!editedMeta) return null;

    return (
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-2xl space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tytuł</label>
            <Input
              value={editedMeta.title}
              onChange={(e) =>
                setEditedMeta((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
              placeholder="Tytuł pieśni"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Opis</label>
            <Textarea
              value={editedMeta.description}
              onChange={(e) =>
                setEditedMeta((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              placeholder="Krótki opis pieśni (opcjonalnie)"
              rows={3}
            />
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Domena</label>
            <div className="relative">
              <select
                value={editedMeta.domain}
                onChange={(e) =>
                  setEditedMeta((prev) =>
                    prev ? { ...prev, domain: e.target.value } : null
                  )
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none cursor-pointer capitalize"
              >
                {domains?.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategorie</label>

            {/* Current categories */}
            {editedMeta.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {editedMeta.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add category */}
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Dodaj kategorię..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {renderCategorySuggestions()}
            </div>

            <p className="text-xs text-muted-foreground">
              Wpisz kategorię i naciśnij Enter lub kliknij +
            </p>
          </div>

          {/* Info */}
          <Card className="p-4 bg-muted/30">
            <h4 className="text-sm font-medium mb-2">Informacje</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>ID:</div>
              <div className="font-mono text-xs">{selectedSong?.meta.id}</div>
              <div>Slajdów:</div>
              <div>{selectedSong?.slides.length}</div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    );
  };

  const renderEditor = () => {
    if (!selectedSong) return null;

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
            {renderEditorTabs()}
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddToScenarioOpen(true)}
            >
              <ListPlus className="h-4 w-4 mr-2" />
              Do scenariusza
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateText.isPending || !hasChanges}
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
        {editorTab === 'content' ? renderContentEditor() : renderMetadataEditor()}
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

      {/* Add to scenario modal */}
      <AddToScenarioModal
        open={isAddToScenarioOpen}
        onClose={() => setIsAddToScenarioOpen(false)}
        step={selectedSong ? { text: createTextReference(selectedSong) } : null}
        itemTitle={selectedSong?.meta.title}
      />
    </div>
  );
}
