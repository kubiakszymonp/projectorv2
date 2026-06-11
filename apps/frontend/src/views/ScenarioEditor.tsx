import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FolderOpen, Music, Plus, Type, Square, QrCode, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createHeadingStep, createBlankStep } from '@/types/scenarios';
import {
  useScenarios,
  useScenario,
  useCreateScenario,
  useUpdateScenario,
  useDeleteScenario,
  useDuplicateScenario,
  useReloadScenarios,
} from '@/hooks/useScenarios';
import { useSetScenario, useScreenState } from '@/hooks/usePlayer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useUnsavedChangesWarning, confirmIfUnsaved } from '@/hooks/useUnsavedChangesWarning';
import { ScenarioList } from '@/components/scenarios/ScenarioList';
import { ScenarioEditorHeader } from '@/components/scenarios/ScenarioEditorHeader';
import { ScenarioMetadataPanel } from '@/components/scenarios/ScenarioMetadataPanel';
import { ScenarioStepsList } from '@/components/scenarios/ScenarioStepsList';
import { CreateScenarioDialog, DeleteScenarioDialog } from '@/components/scenarios/ScenarioDialogs';
import type { ScenarioDoc, ScenarioStep } from '@/types/scenarios';

type ViewMode = 'list' | 'edit';

export function ScenarioEditor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const scenarioIdFromUrl = searchParams.get('id');
  const isMobile = useIsMobile();

  // State
  const [search, setSearch] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDoc | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editedSteps, setEditedSteps] = useState<ScenarioStep[]>([]);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newScenarioTitle, setNewScenarioTitle] = useState('');
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Queries
  const { data: scenarios, isLoading: isLoadingScenarios } = useScenarios({
    search: search || undefined,
  });
  const { data: scenarioFromUrl } = useScenario(scenarioIdFromUrl);

  // Mutations
  const createScenario = useCreateScenario();
  const updateScenario = useUpdateScenario();
  const deleteScenario = useDeleteScenario();
  const duplicateScenario = useDuplicateScenario();
  const reloadScenarios = useReloadScenarios();
  const setScenario = useSetScenario();

  // Screen state for projection indicator
  const { data: screenState } = useScreenState();

  // Computed
  const filteredScenarios = useMemo(() => {
    if (!scenarios) return [];
    // Upcoming/today (date >= dziś) rosnąco na górze, potem bez daty (najnowsze),
    // a stare (archiwalne) spadają na dół malejąco.
    const today = new Date().toISOString().slice(0, 10);
    const rank = (s: ScenarioDoc) => {
      if (!s.meta.date) return 1; // bez daty — środek
      return s.meta.date >= today ? 0 : 2; // nadchodzące / archiwalne
    };
    return [...scenarios].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      if (ra === 0) return (a.meta.date ?? '').localeCompare(b.meta.date ?? ''); // nadchodzące rosnąco
      if (ra === 2) return (b.meta.date ?? '').localeCompare(a.meta.date ?? ''); // archiwalne malejąco
      return b.meta.id.localeCompare(a.meta.id); // bez daty: najnowsze
    });
  }, [scenarios]);

  const hasChanges = useMemo(() => {
    if (!selectedScenario) return false;
    return (
      editedTitle !== selectedScenario.meta.title ||
      editedDescription !== (selectedScenario.meta.description || '') ||
      editedDate !== (selectedScenario.meta.date || '') ||
      JSON.stringify(editedSteps) !== JSON.stringify(selectedScenario.steps)
    );
  }, [selectedScenario, editedTitle, editedDescription, editedDate, editedSteps]);

  const hasMetaChanges = useMemo(() => {
    if (!selectedScenario) return false;
    return (
      editedTitle !== selectedScenario.meta.title ||
      editedDescription !== (selectedScenario.meta.description || '') ||
      editedDate !== (selectedScenario.meta.date || '')
    );
  }, [selectedScenario, editedTitle, editedDescription, editedDate]);

  useUnsavedChangesWarning(hasChanges && viewMode === 'edit');

  // Check if current scenario is being projected
  const isCurrentlyProjecting = useMemo(() => {
    if (!selectedScenario || !screenState) return false;
    if (screenState.mode === 'scenario') {
      return screenState.scenarioId === selectedScenario.meta.id;
    }
    return false;
  }, [selectedScenario, screenState]);

  // Load scenario from URL on mount or when URL changes
  useEffect(() => {
    if (scenarioIdFromUrl && scenarioFromUrl && selectedScenario?.meta.id !== scenarioFromUrl.meta.id) {
      setSelectedScenario(scenarioFromUrl);
      setEditedSteps([...scenarioFromUrl.steps]);
      setEditedTitle(scenarioFromUrl.meta.title);
      setEditedDescription(scenarioFromUrl.meta.description || '');
      setEditedDate(scenarioFromUrl.meta.date || '');
      setViewMode('edit');
      setSelectedStepIndex(null);
    } else if (scenarioIdFromUrl === null && selectedScenario) {
      // URL cleared, go back to list
      setSelectedScenario(null);
      setViewMode('list');
      setEditedSteps([]);
      setEditedTitle('');
      setEditedDescription('');
      setEditedDate('');
      setSelectedStepIndex(null);
    }
  }, [scenarioIdFromUrl, scenarioFromUrl, selectedScenario]);

  // Handlers
  const handleSelectScenario = useCallback((scenario: ScenarioDoc) => {
    setSelectedScenario(scenario);
    setEditedSteps([...scenario.steps]);
    setEditedTitle(scenario.meta.title);
    setEditedDescription(scenario.meta.description || '');
    setEditedDate(scenario.meta.date || '');
    setViewMode('edit');
    setSelectedStepIndex(null);
    // Update URL
    setSearchParams({ id: scenario.meta.id }, { replace: true });
  }, [setSearchParams]);

  const handleBack = useCallback(() => {
    if (!confirmIfUnsaved(hasChanges)) return;
    setSelectedScenario(null);
    setViewMode('list');
    setEditedSteps([]);
    setEditedTitle('');
    setEditedDescription('');
    setEditedDate('');
    setSelectedStepIndex(null);
    // Clear URL
    setSearchParams({}, { replace: true });
  }, [setSearchParams, hasChanges]);

  const handleSave = useCallback(async () => {
    if (!selectedScenario) return;

    const updated = await updateScenario.mutateAsync({
      id: selectedScenario.meta.id,
      data: {
        title: editedTitle,
        description: editedDescription || undefined,
        date: editedDate || '',
        steps: editedSteps,
      },
    });

    setSelectedScenario(updated);
  }, [selectedScenario, editedTitle, editedDescription, editedDate, editedSteps, updateScenario]);

  const handleCreateScenario = useCallback(async () => {
    if (!newScenarioTitle.trim()) return;

    const created = await createScenario.mutateAsync({
      title: newScenarioTitle.trim(),
      steps: [],
    });

    setIsCreateDialogOpen(false);
    setNewScenarioTitle('');
    handleSelectScenario(created);
  }, [newScenarioTitle, createScenario, handleSelectScenario]);

  const handleDeleteScenario = useCallback(async () => {
    if (!selectedScenario) return;

    await deleteScenario.mutateAsync(selectedScenario.meta.id);
    setDeleteDialogOpen(false);
    handleBack();
  }, [selectedScenario, deleteScenario, handleBack]);

  const handleDuplicateScenario = useCallback(async () => {
    if (!selectedScenario) return;
    const copy = await duplicateScenario.mutateAsync(selectedScenario.meta.id);
    handleSelectScenario(copy);
  }, [selectedScenario, duplicateScenario, handleSelectScenario]);

  const handleMoveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setEditedSteps((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const arr = [...prev];
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }, []);

  const handleDeleteStep = useCallback((index: number) => {
    setEditedSteps((prev) => prev.filter((_, i) => i !== index));
    if (selectedStepIndex === index) {
      setSelectedStepIndex(null);
    } else if (selectedStepIndex !== null && selectedStepIndex > index) {
      setSelectedStepIndex(selectedStepIndex - 1);
    }
  }, [selectedStepIndex]);

  const handleGoToSongs = useCallback(() => {
    navigate('/songs');
  }, [navigate]);

  const handleAddHeading = useCallback(() => {
    const heading = window.prompt('Tekst nagłówka:');
    if (heading?.trim()) {
      setEditedSteps((prev) => [...prev, createHeadingStep(heading.trim())]);
    }
  }, []);

  const handleAddBlank = useCallback(() => {
    setEditedSteps((prev) => [...prev, createBlankStep()]);
  }, []);

  const handleAddQR = useCallback(() => {
    const value = window.prompt('Wartość kodu QR (URL lub tekst):');
    if (value?.trim()) {
      setEditedSteps((prev) => [...prev, { qrcode: value.trim() }]);
    }
  }, []);

  const handleAddMedia = useCallback(() => {
    navigate('/media');
  }, [navigate]);

  const handleProjectToScreen = useCallback(() => {
    if (!selectedScenario) return;
    setScenario.mutate({ scenarioId: selectedScenario.meta.id, stepIndex: 0 });
  }, [selectedScenario, setScenario]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === toIndex) {
        setDragOverIndex(null);
        return;
      }

      setEditedSteps((prev) => {
        const newSteps = [...prev];
        const [removed] = newSteps.splice(dragIndex, 1);
        newSteps.splice(toIndex, 0, removed);
        return newSteps;
      });

      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex]
  );

  const renderEditor = () => {
    if (!selectedScenario) return null;

    if (isMobile) {
      return (
        <div className="flex-1 flex flex-col min-h-0">
          <ScenarioEditorHeader
            scenario={selectedScenario}
            stepsCount={editedSteps.length}
            isCurrentlyProjecting={isCurrentlyProjecting}
            hasChanges={hasChanges}
            isSaving={updateScenario.isPending}
            onBack={handleBack}
            onSave={handleSave}
            onDelete={() => setDeleteDialogOpen(true)}
            onDuplicate={handleDuplicateScenario}
            onProjectToScreen={handleProjectToScreen}
            canProject={editedSteps.length > 0}
            isMobile={true}
          />

          <ScenarioMetadataPanel
            scenario={selectedScenario}
            title={editedTitle}
            description={editedDescription}
            date={editedDate}
            onTitleChange={setEditedTitle}
            onDescriptionChange={setEditedDescription}
            onDateChange={setEditedDate}
            hasChanges={hasMetaChanges}
            isMobile={true}
            isOpen={isMetadataOpen}
            onToggle={() => setIsMetadataOpen(!isMetadataOpen)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <ScenarioStepsList
              steps={editedSteps}
              selectedStepIndex={selectedStepIndex}
              dragIndex={dragIndex}
              dragOverIndex={dragOverIndex}
              onSelectStep={setSelectedStepIndex}
              onDeleteStep={handleDeleteStep}
              onMoveStep={handleMoveStep}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onGoToSongs={handleGoToSongs}
            />
          </div>

          <div className="border-t space-y-2 p-3 bg-muted/20">
            <Button
              variant="default"
              className="w-full"
              onClick={handleGoToSongs}
            >
              <Music className="h-4 w-4 mr-2" />
              Dodaj teksty
            </Button>
            <Link
              to={`/files?path=${encodeURIComponent(selectedScenario.filePath)}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <FolderOpen className="h-4 w-4" />
              <span>Otwórz w edytorze plików</span>
            </Link>
          </div>
        </div>
      );
    }

    // Desktop layout
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <ScenarioEditorHeader
          scenario={selectedScenario}
          stepsCount={editedSteps.length}
          isCurrentlyProjecting={isCurrentlyProjecting}
          hasChanges={hasChanges}
          isSaving={updateScenario.isPending}
          onBack={handleBack}
          onSave={handleSave}
          onDelete={() => setDeleteDialogOpen(true)}
          onDuplicate={handleDuplicateScenario}
          onProjectToScreen={handleProjectToScreen}
          canProject={editedSteps.length > 0}
          isMobile={false}
        />

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0 border-r">
            <ScenarioStepsList
              steps={editedSteps}
              selectedStepIndex={selectedStepIndex}
              dragIndex={dragIndex}
              dragOverIndex={dragOverIndex}
              onSelectStep={setSelectedStepIndex}
              onDeleteStep={handleDeleteStep}
              onMoveStep={handleMoveStep}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onGoToSongs={handleGoToSongs}
            />
          </div>

          <ScenarioMetadataPanel
            scenario={selectedScenario}
            title={editedTitle}
            description={editedDescription}
            date={editedDate}
            onTitleChange={setEditedTitle}
            onDescriptionChange={setEditedDescription}
            onDateChange={setEditedDate}
            hasChanges={hasMetaChanges}
            isMobile={false}
          />
        </div>

        <div className="border-t space-y-2 p-3 bg-muted/20">
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleGoToSongs}
            >
              <Music className="h-4 w-4 mr-2" />
              Dodaj teksty
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj krok
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAddHeading}>
                  <Type className="h-4 w-4 mr-2" />
                  Nagłówek
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddBlank}>
                  <Square className="h-4 w-4 mr-2" />
                  Pusty slajd
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddMedia}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Media…
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddQR}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Kod QR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Link
            to={`/files?path=${encodeURIComponent(selectedScenario.filePath)}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Otwórz w edytorze plików</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {viewMode === 'list' ? (
        <ScenarioList
          scenarios={filteredScenarios}
          isLoading={isLoadingScenarios}
          search={search}
          onSearchChange={setSearch}
          onSelectScenario={handleSelectScenario}
          onCreateScenario={() => setIsCreateDialogOpen(true)}
          onReload={() => reloadScenarios.mutate()}
          isReloading={reloadScenarios.isPending}
        />
      ) : (
        renderEditor()
      )}

      <CreateScenarioDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title={newScenarioTitle}
        onTitleChange={setNewScenarioTitle}
        onCreate={handleCreateScenario}
        isPending={createScenario.isPending}
      />

      <DeleteScenarioDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        scenario={selectedScenario}
        onDelete={handleDeleteScenario}
        isPending={deleteScenario.isPending}
      />
    </div>
  );
}
