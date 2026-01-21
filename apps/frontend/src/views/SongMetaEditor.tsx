import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Tags,
  Loader2,
  Save,
  X,
  ChevronDown,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTexts, useDomains, useUpdateText, useDeleteText } from '@/hooks/useTexts';
import type { TextDoc } from '@/types/texts';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export function SongMetaEditor() {
  // State
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<TextDoc | null>(null);
  const [editedMeta, setEditedMeta] = useState<{
    title: string;
    description: string;
    categories: string[];
    domain: string;
  } | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Queries
  const { data: songs, isLoading: isLoadingSongs } = useTexts({
    domain: selectedDomain ?? undefined,
    search: search || undefined,
  });
  const { data: domains } = useDomains();

  // Mutations
  const updateText = useUpdateText();
  const deleteText = useDeleteText();

  // Computed
  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    return songs.sort((a, b) => a.meta.title.localeCompare(b.meta.title, 'pl'));
  }, [songs]);

  const allCategories = useMemo(() => {
    if (!songs) return [];
    const cats = new Set<string>();
    songs.forEach((song) => {
      song.meta.categories?.forEach((c) => cats.add(c));
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [songs]);

  const hasChanges = useMemo(() => {
    if (!selectedSong || !editedMeta) return false;
    return (
      editedMeta.title !== selectedSong.meta.title ||
      editedMeta.description !== (selectedSong.meta.description || '') ||
      editedMeta.domain !== selectedSong.meta.domain ||
      JSON.stringify(editedMeta.categories.sort()) !==
        JSON.stringify([...(selectedSong.meta.categories || [])].sort())
    );
  }, [selectedSong, editedMeta]);

  // Effects
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
    setNewCategory('');
  }, []);

  const handleClose = useCallback(() => {
    setSelectedSong(null);
    setEditedMeta(null);
    setNewCategory('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedSong || !editedMeta) return;

    const updated = await updateText.mutateAsync({
      id: selectedSong.meta.id,
      data: {
        title: editedMeta.title,
        description: editedMeta.description || undefined,
        categories: editedMeta.categories,
        domain: editedMeta.domain,
      },
    });

    setSelectedSong(updated);
  }, [selectedSong, editedMeta, updateText]);

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

  const handleDelete = useCallback(async () => {
    if (!selectedSong) return;
    
    await deleteText.mutateAsync(selectedSong.meta.id);
    setDeleteDialogOpen(false);
    handleClose();
  }, [selectedSong, deleteText, handleClose]);

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

  return (
    <div className="h-screen flex bg-background">
      {/* Left panel - song list */}
      <div className="w-96 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 space-y-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Tags className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Edytor metatagów</h1>
              <p className="text-sm text-muted-foreground">
                Wyszukuj i edytuj metadane pieśni
              </p>
            </div>
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
          <div className="p-2 space-y-1">
            {isLoadingSongs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Brak pieśni</p>
              </div>
            ) : (
              filteredSongs.map((song) => (
                <button
                  key={song.meta.id}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    selectedSong?.meta.id === song.meta.id
                      ? 'bg-amber-500/10 text-foreground'
                      : 'hover:bg-muted/50'
                  )}
                  onClick={() => handleSelectSong(song)}
                >
                  <div className="font-medium truncate">{song.meta.title}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="capitalize">{song.meta.domain}</span>
                    {song.meta.categories && song.meta.categories.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="truncate">
                          {song.meta.categories.length} kategorii
                        </span>
                      </>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right panel - editor */}
      <div className="flex-1 flex flex-col">
        {selectedSong && editedMeta ? (
          <>
            {/* Editor header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">Edycja metadanych</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || updateText.isPending}
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat)}
                            className="hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
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
                    <div className="font-mono text-xs">{selectedSong.meta.id}</div>
                    <div>Slajdów:</div>
                    <div>{selectedSong.slides.length}</div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Tags className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Wybierz pieśń</p>
              <p className="text-sm">
                Kliknij pieśń z listy, aby edytować jej metadane
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń pieśń</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć pieśń "{selectedSong?.meta.title}"? 
              Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteText.isPending}
            >
              {deleteText.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

