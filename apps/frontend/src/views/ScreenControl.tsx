import React from 'react';
import {
  Monitor,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Image,
  Video,
  Music2,
  FileText,
  Type,
  Square,
  ListOrdered,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  useScreenState,
  useClearScreen,
  useNavigateSlide,
  useNavigateStep,
  useToggleVisibility,
} from '@/hooks/usePlayer';
import type { ScreenState, DisplayItem, TextDisplayItem } from '@/types/player';
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
      return item.path.split('/').pop() ?? item.path;
    case 'heading':
      return item.content;
    case 'blank':
      return 'Pusty slajd';
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
  const { data: screenState, isLoading } = useScreenState();
  const clearScreen = useClearScreen();
  const navigateSlide = useNavigateSlide();
  const navigateStep = useNavigateStep();
  const toggleVisibility = useToggleVisibility();

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

  const handleToggleVisibility = () => {
    toggleVisibility.mutate();
  };

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
  const isVisible = state.mode !== 'empty' && state.visible;
  const hasContent = state.mode !== 'empty';

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold">Sterowanie ekranem</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Visibility Switch */}
          {hasContent && (
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm',
                isVisible ? 'text-emerald-400' : 'text-muted-foreground'
              )}>
                {isVisible ? 'Ekran włączony' : 'Ekran wygaszony'}
              </span>
              <Switch
                checked={isVisible}
                onCheckedChange={handleToggleVisibility}
                disabled={toggleVisibility.isPending}
                className={cn(
                  isVisible && 'data-[state=checked]:bg-emerald-600'
                )}
              />
            </div>
          )}
          {/* Clear Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearScreen}
            disabled={!hasContent || clearScreen.isPending}
            className="text-muted-foreground hover:text-destructive"
            title="Wyczyść ekran"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="w-full space-y-4 p-6">
          {/* Current State Card */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Aktualnie na ekranie</h2>
            </div>
            <div className="p-0">
              <CurrentStateDisplay state={state} />
            </div>
          </Card>

          {/* Controls Card */}
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

          {/* Info Card */}
          {state.mode === 'scenario' && (
            <Card>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Scenariusz</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <ListOrdered className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="font-medium">{state.scenarioTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Krok {state.stepIndex + 1} z {state.totalSteps}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function CurrentStateDisplay({ state }: { state: ScreenState }) {
  if (state.mode === 'empty') {
    return (
      <div className="w-full aspect-video bg-muted/50 flex items-center justify-center border border-dashed">
        <div className="text-center text-muted-foreground">
          <Square className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="text-lg font-medium">Ekran pusty</p>
          <p className="text-sm">Wybierz tekst lub medium do wyświetlenia</p>
        </div>
      </div>
    );
  }

  const item = state.mode === 'single' ? state.item : state.currentItem;

  // Info o aktualnym elemencie
  const itemInfo = (
    <div className="flex items-center justify-between text-sm p-4 border-t bg-muted/30">
      <div className="flex items-center gap-2">
        <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', getDisplayItemColor(item))}>
          {getDisplayItemIcon(item)}
        </div>
        <span className="font-medium">{getDisplayItemLabel(item)}</span>
      </div>
      {item.type === 'text' && (
        <span className="text-muted-foreground">
          Slajd {item.slideIndex + 1} z {item.totalSlides}
        </span>
      )}
    </div>
  );

  // Iframe z rzeczywistym widokiem ekranu - proporcje 1920x1080, skalowany jako mini podgląd
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scaleValue = containerWidth / 1920;
        setScale(scaleValue);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="w-full">
      <div className="w-full flex items-center justify-center bg-black py-4">
        <div 
          ref={containerRef}
          className="bg-black relative overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '1200px', // Mini podgląd - maksymalna szerokość
            aspectRatio: '1920/1080', // Dokładne proporcje 1920x1080
          }}
        >
          <iframe
            src="/display"
            className="border-0"
            title="Podgląd ekranu"
            allow="fullscreen"
            style={{
              pointerEvents: 'none',
              width: '1920px',
              height: '1080px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </div>
      {itemInfo}
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
  const currentItem = state.mode === 'single' ? state.item : state.mode === 'scenario' ? state.currentItem : null;
  const isTextItem = currentItem?.type === 'text';
  const isScenarioMode = state.mode === 'scenario';

  // Info o slajdach dla tekstu
  const textItem = isTextItem ? (currentItem as TextDisplayItem) : null;
  const isFirstSlide = textItem ? textItem.slideIndex === 0 : true;
  const isLastSlide = textItem ? textItem.slideIndex === textItem.totalSlides - 1 : true;

  // Info o krokach dla scenariusza
  const isFirstStep = isScenarioMode ? (state as { stepIndex: number }).stepIndex === 0 : true;
  const isLastStep = isScenarioMode 
    ? (state as { stepIndex: number; totalSteps: number }).stepIndex === (state as { totalSteps: number }).totalSteps - 1 
    : true;

  return (
    <div className="space-y-6">
      {/* Slide navigation - only for text items */}
      {isTextItem && textItem && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground">
            Nawigacja slajdów
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14"
              onClick={onPrevSlide}
              disabled={isNavigating || isFirstSlide}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="text-center min-w-[100px]">
              <span className="text-2xl font-bold">
                {textItem.slideIndex + 1}
              </span>
              <span className="text-muted-foreground text-lg"> / {textItem.totalSlides}</span>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14"
              onClick={onNextSlide}
              disabled={isNavigating || isLastSlide}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          {isFirstSlide && <p className="text-xs text-center text-muted-foreground">Początek tekstu</p>}
          {isLastSlide && !isFirstSlide && <p className="text-xs text-center text-muted-foreground">Koniec tekstu</p>}
        </div>
      )}

      {/* Step navigation - only for scenario mode */}
      {isScenarioMode && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground">
            Nawigacja elementów scenariusza
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="h-14 px-6"
              onClick={onPrevStep}
              disabled={isNavigating || isFirstStep}
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
              disabled={isNavigating || isLastStep}
            >
              Następny
              <SkipForward className="h-5 w-5 ml-2" />
            </Button>
          </div>
          {isFirstStep && <p className="text-xs text-center text-muted-foreground">Początek scenariusza</p>}
          {isLastStep && !isFirstStep && <p className="text-xs text-center text-muted-foreground">Koniec scenariusza</p>}
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
