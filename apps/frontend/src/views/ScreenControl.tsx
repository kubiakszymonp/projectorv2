import {
  Monitor,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Loader2,
  Image,
  Video,
  Music2,
  FileText,
  Type,
  Square,
  ListOrdered,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useScreenState,
  useClearScreen,
  useNavigateSlide,
  useNavigateStep,
} from '@/hooks/usePlayer';
import type { ScreenState, DisplayItem } from '@/types/player';
import { cn } from '@/lib/utils';

// ========== HELPERS ==========

function getDisplayItemIcon(item: DisplayItem) {
  switch (item.type) {
    case 'text':
      return <FileText className="h-5 w-5" />;
    case 'image':
      return <Image className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'audio':
      return <Music2 className="h-5 w-5" />;
    case 'heading':
      return <Type className="h-5 w-5" />;
    case 'blank':
      return <Square className="h-5 w-5" />;
  }
}

function getDisplayItemLabel(item: DisplayItem): string {
  switch (item.type) {
    case 'text':
      // Extract title from path like "songs/barka__01HXZ..."
      const parts = item.textRef.split('/');
      const filename = parts[parts.length - 1];
      const title = filename.split('__')[0];
      return title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');
    case 'image':
    case 'video':
    case 'audio':
      return item.path;
    case 'heading':
      return item.content;
    case 'blank':
      return 'Pusty slajd';
  }
}

function getDisplayItemTypeLabel(item: DisplayItem): string {
  switch (item.type) {
    case 'text':
      return 'Tekst';
    case 'image':
      return 'Obraz';
    case 'video':
      return 'Wideo';
    case 'audio':
      return 'Audio';
    case 'heading':
      return 'Nagłówek';
    case 'blank':
      return 'Pusty';
  }
}

function getDisplayItemColor(item: DisplayItem): string {
  switch (item.type) {
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
}

// ========== COMPONENT ==========

export function ScreenControl() {
  const { data: screenState, isLoading } = useScreenState(1000); // Poll every second
  const clearScreen = useClearScreen();
  const navigateSlide = useNavigateSlide();
  const navigateStep = useNavigateStep();

  const handleClearScreen = () => {
    clearScreen.mutate();
  };

  const handlePrevSlide = () => {
    navigateSlide.mutate('prev');
  };

  const handleNextSlide = () => {
    navigateSlide.mutate('next');
  };

  const handlePrevStep = () => {
    navigateStep.mutate('prev');
  };

  const handleNextStep = () => {
    navigateStep.mutate('next');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="flex items-center gap-2 px-4 py-3 border-b">
          <Monitor className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold">Sterowanie ekranem</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  const state = screenState ?? { mode: 'empty' as const };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold">Sterowanie ekranem</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearScreen}
          disabled={state.mode === 'empty' || clearScreen.isPending}
          className="text-destructive hover:text-destructive"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Wyczyść ekran
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Current State Card */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Aktualnie na ekranie</h2>
            </div>
            <div className="p-6">
              <CurrentStateDisplay state={state} />
            </div>
          </Card>

          {/* Controls Card - only show if there's something on screen */}
          {state.mode !== 'empty' && (
            <Card>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Kontrola</h2>
              </div>
              <div className="p-6">
                <ControlsSection
                  state={state}
                  onPrevSlide={handlePrevSlide}
                  onNextSlide={handleNextSlide}
                  onPrevStep={handlePrevStep}
                  onNextStep={handleNextStep}
                  isNavigating={navigateSlide.isPending || navigateStep.isPending}
                />
              </div>
            </Card>
          )}

          {/* Status Card */}
          <Card>
            <div className="p-4 border-b">
              <h2 className="font-semibold">Status</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tryb:</span>
                  <span className="font-medium">
                    {state.mode === 'empty' && 'Ekran pusty'}
                    {state.mode === 'single' && 'Pojedynczy element'}
                    {state.mode === 'scenario' && 'Scenariusz'}
                  </span>
                </div>
                {state.mode === 'scenario' && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Scenariusz:</span>
                    <span className="font-medium">{state.scenarioTitle}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function CurrentStateDisplay({ state }: { state: ScreenState }) {
  if (state.mode === 'empty') {
    return (
      <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border border-dashed">
        <div className="text-center text-muted-foreground">
          <Square className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="text-lg font-medium">Ekran pusty</p>
          <p className="text-sm">Wybierz tekst lub medium do wyświetlenia</p>
        </div>
      </div>
    );
  }

  const item = state.mode === 'single' ? state.item : state.currentItem;

  return (
    <div className="space-y-4">
      {/* Preview area */}
      <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center border">
        <div className="text-center text-white p-8">
          <div
            className={cn(
              'w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4',
              getDisplayItemColor(item)
            )}
          >
            {getDisplayItemIcon(item)}
          </div>
          <p className="text-xl font-medium">{getDisplayItemLabel(item)}</p>
          <p className="text-sm text-slate-400 mt-1">{getDisplayItemTypeLabel(item)}</p>
          {item.type === 'text' && (
            <p className="text-sm text-slate-400 mt-2">
              Slajd {item.slideIndex + 1}
            </p>
          )}
        </div>
      </div>

      {/* Scenario info */}
      {state.mode === 'scenario' && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium">{state.scenarioTitle}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Krok {state.stepIndex + 1} z {state.totalSteps}
          </span>
        </div>
      )}
    </div>
  );
}

interface ControlsSectionProps {
  state: ScreenState;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  isNavigating: boolean;
}

function ControlsSection({
  state,
  onPrevSlide,
  onNextSlide,
  onPrevStep,
  onNextStep,
  isNavigating,
}: ControlsSectionProps) {
  // Determine if current item is text (can navigate slides)
  const currentItem = state.mode === 'single' ? state.item : state.mode === 'scenario' ? state.currentItem : null;
  const isTextItem = currentItem?.type === 'text';
  const isScenarioMode = state.mode === 'scenario';

  return (
    <div className="space-y-6">
      {/* Slide navigation - only for text items */}
      {isTextItem && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-center text-muted-foreground">
            Nawigacja slajdów
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14"
              onClick={onPrevSlide}
              disabled={isNavigating}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="text-center min-w-[80px]">
              <span className="text-2xl font-bold">
                {(currentItem as { slideIndex: number }).slideIndex + 1}
              </span>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14"
              onClick={onNextSlide}
              disabled={isNavigating}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Step navigation - only for scenario mode */}
      {isScenarioMode && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-center text-muted-foreground">
            Nawigacja elementów scenariusza
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="h-14 px-6"
              onClick={onPrevStep}
              disabled={isNavigating || (state as { stepIndex: number }).stepIndex === 0}
            >
              <SkipBack className="h-5 w-5 mr-2" />
              Poprzedni
            </Button>
            <div className="text-center min-w-[100px]">
              <span className="text-lg font-medium">
                {(state as { stepIndex: number; totalSteps: number }).stepIndex + 1} / {(state as { totalSteps: number }).totalSteps}
              </span>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="h-14 px-6"
              onClick={onNextStep}
              disabled={
                isNavigating ||
                (state as { stepIndex: number; totalSteps: number }).stepIndex ===
                  (state as { totalSteps: number }).totalSteps - 1
              }
            >
              Następny
              <SkipForward className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Media info - for non-text items */}
      {currentItem && !isTextItem && !isScenarioMode && (
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Wyświetlane medium nie wymaga nawigacji</p>
        </div>
      )}
    </div>
  );
}
