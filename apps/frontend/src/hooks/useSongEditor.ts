import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTexts, useDomains, useCreateText, useUpdateText } from '@/hooks/useTexts';
import type { TextDoc } from '@/types/texts';
import type {
  ViewMode,
  EditorTab,
  MobileContentTab,
  EditedMeta,
  NewSongData,
} from '@/types/songCatalog';

export function useSongEditor() {
  // State
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<TextDoc | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editorTab, setEditorTab] = useState<EditorTab>('content');
  const [editContent, setEditContent] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSongData, setNewSongData] = useState<NewSongData>({ title: '', domain: 'songs' });
  const [previewSlide, setPreviewSlide] = useState<number | null>(null);
  const [isAddToScenarioOpen, setIsAddToScenarioOpen] = useState(false);

  // Mobile-specific state
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [mobileContentTab, setMobileContentTab] = useState<MobileContentTab>('text');

  // Metadata editing state
  const [editedMeta, setEditedMeta] = useState<EditedMeta | null>(null);
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

  const handleSelectCategory = useCallback((category: string) => {
    if (!editedMeta) return;
    setEditedMeta((prev) =>
      prev ? { ...prev, categories: [...prev.categories, category] } : null
    );
    setNewCategory('');
  }, [editedMeta]);

  return {
    // State
    search,
    setSearch,
    selectedDomain,
    setSelectedDomain,
    selectedSong,
    viewMode,
    editorTab,
    setEditorTab,
    editContent,
    setEditContent,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newSongData,
    setNewSongData,
    previewSlide,
    setPreviewSlide,
    isAddToScenarioOpen,
    setIsAddToScenarioOpen,
    isMetadataOpen,
    setIsMetadataOpen,
    mobileContentTab,
    setMobileContentTab,
    editedMeta,
    setEditedMeta,
    newCategory,
    setNewCategory,

    // Queries
    songs,
    filteredSongs,
    isLoadingSongs,
    domains,
    allCategories,

    // Mutations
    createText,
    updateText,

    // Computed
    hasContentChanges,
    hasMetaChanges,
    hasChanges,

    // Handlers
    handleSelectSong,
    handleBack,
    handleSave,
    handleCreateSong,
    handleAddCategory,
    handleRemoveCategory,
    handleSelectCategory,
  };
}

export type UseSongEditorReturn = ReturnType<typeof useSongEditor>;

