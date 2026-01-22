import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  ListOrdered,
  Loader2,
  ChevronRight,
  Save,
  X,
  Trash2,
  GripVertical,
  FileText,
  Image,
  Video,
  Music2,
  Type,
  Square,
  MoreVertical,
  Music,
  Monitor,
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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useScenarios,
  useCreateScenario,
  useUpdateScenario,
  useDeleteScenario,
} from '@/hooks/useScenarios';
import { useSetScenario, useScreenState } from '@/hooks/usePlayer';
import type { ScenarioDoc, ScenarioStep } from '@/types/scenarios';
import { getStepType, getStepValue } from '@/types/scenarios';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'edit';

// ========== STEP ITEM COMPONENT ==========

type StepItemProps = {
  step: ScenarioStep;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
};

function StepItem({
  step,
  index,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: StepItemProps) {
  const stepType = getStepType(step);
  const stepValue = getStepValue(step);

  const getStepIcon = () => {
    switch (stepType) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music2 className="h-4 w-4" />;
      case 'heading':
        return <Type className="h-4 w-4" />;
      case 'blank':
        return <Square className="h-4 w-4" />;
    }
  };

  const getStepLabel = () => {
    switch (stepType) {
      case 'text':
        // Extract title from path like "songs/barka__01HXZ..."
        const parts = (stepValue as string).split('/');
        const filename = parts[parts.length - 1];
        const title = filename.split('__')[0];
        return title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');
      case 'image':
      case 'video':
      case 'audio':
        return stepValue as string;
      case 'heading':
        return stepValue as string;
      case 'blank':
        return 'Pusty slajd';
    }
  };

  const getStepColor = () => {
    switch (stepType) {
      case 'text':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'image':
        return 'text-purple-400 bg-purple-500/10';
      case 'video':
        return 'text-pink-400 bg-pink-500/10';
      case 'audio':
        return 'text-amber-400 bg-amber-500/10';
      case 'heading':
        return 'text-blue-400 bg-blue-500/10';
      case 'blank':
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move',
        isSelected && 'ring-2 ring-primary',
        isDragging && 'opacity-50',
        isDragOver && 'border-primary border-dashed bg-primary/5',
        !isDragging && !isDragOver && 'bg-card hover:bg-muted/50'
      )}
      onClick={onSelect}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      <span className="text-sm text-muted-foreground font-mono w-6">{index + 1}</span>

      <div className={cn('w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0', getStepColor())}>
        {getStepIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{getStepLabel()}</p>
        <p className="text-xs text-muted-foreground capitalize">{stepType}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Usuń
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export function ScenarioEditor() {
  const navigate = useNavigate();

  // State
  const [search, setSearch] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDoc | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editedSteps, setEditedSteps] = useState<ScenarioStep[]>([]);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newScenarioTitle, setNewScenarioTitle] = useState('');

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Queries
  const { data: scenarios, isLoading: isLoadingScenarios } = useScenarios({
    search: search || undefined,
  });

  // Mutations
  const createScenario = useCreateScenario();
  const updateScenario = useUpdateScenario();
  const deleteScenario = useDeleteScenario();
  const setScenario = useSetScenario();

  // Screen state for projection indicator
  const { data: screenState } = useScreenState();

  // Computed
  const filteredScenarios = useMemo(() => {
    if (!scenarios) return [];
    return scenarios.sort((a, b) => b.meta.id.localeCompare(a.meta.id)); // Newest first
  }, [scenarios]);

  const hasChanges = useMemo(() => {
    if (!selectedScenario) return false;
    return (
      editedTitle !== selectedScenario.meta.title ||
      editedDescription !== (selectedScenario.meta.description || '') ||
      JSON.stringify(editedSteps) !== JSON.stringify(selectedScenario.steps)
    );
  }, [selectedScenario, editedTitle, editedDescription, editedSteps]);

  // Check if current scenario is being projected
  const isCurrentlyProjecting = useMemo(() => {
    if (!selectedScenario || !screenState) return false;
    if (screenState.mode === 'scenario') {
      return screenState.scenarioId === selectedScenario.meta.id;
    }
    return false;
  }, [selectedScenario, screenState]);

  // Handlers
  const handleSelectScenario = useCallback((scenario: ScenarioDoc) => {
    setSelectedScenario(scenario);
    setEditedSteps([...scenario.steps]);
    setEditedTitle(scenario.meta.title);
    setEditedDescription(scenario.meta.description || '');
    setViewMode('edit');
    setSelectedStepIndex(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedScenario(null);
    setViewMode('list');
    setEditedSteps([]);
    setEditedTitle('');
    setEditedDescription('');
    setSelectedStepIndex(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedScenario) return;

    const updated = await updateScenario.mutateAsync({
      id: selectedScenario.meta.id,
      data: {
        title: editedTitle,
        description: editedDescription || undefined,
        steps: editedSteps,
      },
    });

    setSelectedScenario(updated);
  }, [selectedScenario, editedTitle, editedDescription, editedSteps, updateScenario]);

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

  // Render helpers
  const renderScenarioList = () => (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="p-4 space-y-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Scenariusze</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nowy scenariusz
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj scenariuszy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Scenario list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {isLoadingScenarios ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredScenarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListOrdered className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Brak scenariuszy</p>
              <p className="text-sm">
                {search
                  ? 'Nie znaleziono scenariuszy pasujących do wyszukiwania'
                  : 'Dodaj pierwszy scenariusz, klikając "Nowy scenariusz"'}
              </p>
            </div>
          ) : (
            filteredScenarios.map((scenario) => (
              <Card
                key={scenario.meta.id}
                className="group cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => handleSelectScenario(scenario)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <ListOrdered className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{scenario.meta.title}</h3>
                    {scenario.meta.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {scenario.meta.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {scenario.steps.length} kroków
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
    if (!selectedScenario) return null;

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <X className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{selectedScenario.meta.title}</h1>
              <p className="text-sm text-muted-foreground">
                {editedSteps.length} kroków
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isCurrentlyProjecting ? 'default' : 'outline'}
              size="sm"
              onClick={handleProjectToScreen}
              disabled={editedSteps.length === 0}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Rzutuj
            </Button>
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
              disabled={!hasChanges || updateScenario.isPending}
            >
              {updateScenario.isPending ? (
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
          {/* Steps list */}
          <div className="flex-1 flex flex-col min-w-0 border-r">
            <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-medium">
                Kroki ({editedSteps.length})
              </span>
              <Button size="sm" variant="outline" onClick={handleGoToSongs}>
                <Music className="h-4 w-4 mr-2" />
                Dodaj z katalogu
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {editedSteps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ListOrdered className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Brak kroków</p>
                    <p className="text-xs mt-1">
                      Przejdź do katalogu pieśni i dodaj teksty
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={handleGoToSongs}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Przejdź do katalogu
                    </Button>
                  </div>
                ) : (
                  editedSteps.map((step, index) => (
                    <StepItem
                      key={index}
                      step={step}
                      index={index}
                      isSelected={selectedStepIndex === index}
                      isDragging={dragIndex === index}
                      isDragOver={dragOverIndex === index}
                      onSelect={() => setSelectedStepIndex(index)}
                      onDelete={() => handleDeleteStep(index)}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Metadata panel */}
          <div className="w-80 flex flex-col bg-muted/20">
            <div className="p-3 border-b bg-muted/30">
              <span className="text-sm font-medium">Metadane</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tytuł</label>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Tytuł scenariusza"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Opis</label>
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Opcjonalny opis"
                    rows={3}
                  />
                </div>
                <Card className="p-4 bg-muted/30">
                  <h4 className="text-sm font-medium mb-2">Informacje</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>ID:</div>
                    <div className="font-mono text-xs truncate">{selectedScenario.meta.id}</div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {viewMode === 'list' ? renderScenarioList() : renderEditor()}

      {/* Create dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nowy scenariusz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tytuł</label>
              <Input
                placeholder="np. Niedziela 11:00"
                value={newScenarioTitle}
                onChange={(e) => setNewScenarioTitle(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleCreateScenario}
              disabled={!newScenarioTitle.trim() || createScenario.isPending}
            >
              {createScenario.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Utwórz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń scenariusz</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć scenariusz "{selectedScenario?.meta.title}"?
              Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteScenario}
              disabled={deleteScenario.isPending}
            >
              {deleteScenario.isPending && (
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
