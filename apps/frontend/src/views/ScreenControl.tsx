import React from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Square,
  ListOrdered,
  Trash2,
  Edit,
  WifiOff,
  Tv,
  TvMinimal,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  useScreenState,
  useClearScreen,
  useNavigateSlide,
  useNavigateStep,
  useSetScenario,
  useToggleVisibility,
} from '@/hooks/usePlayer';
import { useScenario } from '@/hooks/useScenarios';
import { useText } from '@/hooks/useTexts';
import { useSocketStatus } from '@/hooks/useSocket';
import { useScreenConnections } from '@/hooks/useScreenConnections';
import { useSettings } from '@/hooks/useSettings';
import { QuickSearchDialog } from '@/components/control/QuickSearchDialog';
import { getStepStyle } from '@/lib/stepStyles';
import { SlideRenderer } from '@/components/display/SlideRenderer';
import { DEFAULT_SETTINGS } from '@/types/settings';
import type { ScreenState, DisplayItem, TextDisplayItem } from '@/types/player';
import { getStepType, getStepValue } from '@/types/scenarios';
import { cn } from '@/lib/utils';

// ========== HELPERS ==========

function getDisplayItemIcon(item: DisplayItem) {
  const Icon = getStepStyle(item.type).icon;
  return <Icon className="h-5 w-5" />;
}

function getDisplayItemLabel(item: DisplayItem): string {
  switch (item.type) {
    case 'text':
      // Extract title from path like "songs/barka__01HXZ..."
      // Note: This is a fallback - actual title should come from screenState
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
    case 'qrcode':
      return 'Kod QR';
  }
}

function getDisplayItemColor(item: DisplayItem): string {
  return getStepStyle(item.type).color;
}

// ========== COMPONENT ==========

export function ScreenControl() {
  const { data: screenState, isLoading } = useScreenState();
  const isConnected = useSocketStatus();
  const { data: connections } = useScreenConnections();
  const displayConnected = (connections?.displays ?? 0) > 0;
  const [quickSearchOpen, setQuickSearchOpen] = React.useState(false);
  const clearScreen = useClearScreen();
  const navigateSlide = useNavigateSlide();
  const navigateStep = useNavigateStep();
  const setScenario = useSetScenario();
  const toggleVisibility = useToggleVisibility();
  
  // Get full scenario data if in scenario mode
  const scenarioId = screenState?.mode === 'scenario' ? screenState.scenarioId : null;
  const { data: scenario } = useScenario(scenarioId);

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

  // Skróty klawiaturowe dla operatora (laptop). Ignoruj, gdy fokus w polu tekstowym.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd+K — szybkie wyszukiwanie (działa też w polach tekstowych)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setQuickSearchOpen(true);
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          navigateSlide.mutate('next');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateSlide.mutate('prev');
          break;
        case 'PageDown':
          e.preventDefault();
          navigateStep.mutate('next');
          break;
        case 'PageUp':
          e.preventDefault();
          navigateStep.mutate('prev');
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          toggleVisibility.mutate();
          break;
        case 'Escape':
          e.preventDefault();
          if (window.confirm('Wyczyścić ekran?')) {
            clearScreen.mutate();
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="app-page flex flex-col bg-background">
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
    <div className="app-page flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold">Sterowanie ekranem</h1>
          {!isConnected && (
            <span
              className="flex items-center gap-1 text-xs text-amber-400"
              title="Brak połączenia z serwerem — próba ponownego połączenia…"
            >
              <WifiOff className="h-4 w-4" />
              <span className="hidden sm:inline">Brak połączenia</span>
            </span>
          )}
          {isConnected && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                displayConnected ? 'text-emerald-400' : 'text-amber-400',
              )}
              title={displayConnected ? 'Ekran połączony' : 'Brak połączonego ekranu'}
            >
              {displayConnected ? (
                <Tv className="h-4 w-4" />
              ) : (
                <TvMinimal className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {displayConnected ? 'Ekran połączony' : 'Brak ekranu'}
              </span>
            </span>
          )}
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
          {/* Quick search */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuickSearchOpen(true)}
            title="Szybkie wyszukiwanie pieśni (Ctrl+K)"
            className="gap-1.5"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Szukaj</span>
          </Button>
          {/* Clear Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearScreen}
            disabled={!hasContent || clearScreen.isPending}
            className="text-muted-foreground hover:text-destructive gap-1.5"
            title="Wyczyść ekran"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Wyczyść</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="w-full space-y-4 p-4 sm:p-6">
          {/* Prepared-but-hidden banner */}
          {hasContent && !isVisible && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
              <span className="text-sm text-amber-300">
                Treść przygotowana — ekran jest wygaszony.
              </span>
              <Button
                size="sm"
                onClick={handleToggleVisibility}
                disabled={toggleVisibility.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Pokaż na ekranie
              </Button>
            </div>
          )}

          {/* Current State */}
          <Card className="overflow-hidden">
            <div className="p-0">
              <CurrentStateDisplay state={state} />
            </div>
          </Card>

          {/* Controls */}
          {state.mode !== 'empty' && (
            <Card>
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

          {/* Scenario Info and Steps */}
          {state.mode === 'scenario' && scenario && (
            <Card className="flex flex-col" style={{ minHeight: 'calc(100vh - 400px)' }}>
              <div className="p-4 border-b shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ListOrdered className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="font-medium">{state.scenarioTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Krok {state.stepIndex + 1} z {state.totalSteps}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/scenarios?id=${state.scenarioId}`}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edytuj
                  </Link>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {scenario.steps.map((step, index) => {
                    const isActive = index === state.stepIndex;
                    return (
                      <ScenarioStepItem
                        key={index}
                        step={step}
                        index={index}
                        isActive={isActive}
                        onClick={() => setScenario.mutate({ scenarioId: state.scenarioId, stepIndex: index })}
                      />
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <QuickSearchDialog
        open={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
      />
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function CurrentStateDisplay({ state }: { state: ScreenState }) {
  // Pobierz prawdziwy tytuł aktualnego tekstu (z metadanych, nie ze sluga).
  // Hook musi być wywołany bezwarunkowo — przed early-return dla 'empty'.
  const currentItem =
    state.mode === 'single'
      ? state.item
      : state.mode === 'scenario'
        ? state.currentItem
        : null;
  const textRef = currentItem?.type === 'text' ? currentItem.textRef : null;
  const textId = textRef ? textRef.split('__').pop() || null : null;
  const { data: textDoc } = useText(textId);
  const { data: settings } = useSettings();
  const previewDisplaySettings = settings?.display ?? DEFAULT_SETTINGS.display;

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
  const itemLabel =
    item.type === 'text' && textDoc ? textDoc.meta.title : getDisplayItemLabel(item);

  // Podgląd następnego slajdu (przybliżony — poziom slajdu, nie strony)
  let nextPreview: string | null = null;
  if (item.type === 'text' && textDoc) {
    if (item.pageIndex < item.totalPages - 1) {
      nextPreview = '(następna strona tego slajdu)';
    } else if (item.slideIndex + 1 < textDoc.slides.length) {
      nextPreview = textDoc.slides[item.slideIndex + 1];
    } else {
      nextPreview = '(koniec tekstu)';
    }
  }

  // Info o aktualnym elemencie
  const itemInfo = (
    <div className="flex items-center justify-between text-sm p-4 border-t bg-muted/30">
      <div className="flex items-center gap-2">
        <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', getDisplayItemColor(item))}>
          {getDisplayItemIcon(item)}
        </div>
        <span className="font-medium">{itemLabel}</span>
      </div>
      {item.type === 'text' && (
        <span className="text-muted-foreground">
          Slajd {item.slideIndex + 1} z {item.totalSlides}
          {item.totalPages > 1 && `, Strona ${item.pageIndex + 1} z ${item.totalPages}`}
        </span>
      )}
    </div>
  );

  // Podgląd przez współdzielony SlideRenderer (1920x1080 skalowany), bez iframe.
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / 1920);
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
          <div
            style={{
              pointerEvents: 'none',
              width: '1920px',
              height: '1080px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: previewDisplaySettings.backgroundColor,
            }}
          >
            <SlideRenderer state={state} displaySettings={previewDisplaySettings} preview />
          </div>
        </div>
      </div>
      {itemInfo}
      {nextPreview && (
        <div className="px-4 py-3 border-t bg-muted/10">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Następny slajd:
          </p>
          <p className="text-sm whitespace-pre-line line-clamp-3 text-muted-foreground">
            {nextPreview}
          </p>
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
  const currentItem = state.mode === 'single' ? state.item : state.mode === 'scenario' ? state.currentItem : null;
  const isTextItem = currentItem?.type === 'text';
  const isScenarioMode = state.mode === 'scenario';

  // Info o slajdach i stronach dla tekstu
  const textItem = isTextItem ? (currentItem as TextDisplayItem) : null;
  const isFirstSlide = textItem ? textItem.slideIndex === 0 : true;
  const isLastSlide = textItem ? textItem.slideIndex === textItem.totalSlides - 1 : true;
  const isFirstPage = textItem ? textItem.pageIndex === 0 : true;
  const isLastPage = textItem ? textItem.pageIndex === textItem.totalPages - 1 : true;
  const isFirstPageOfFirstSlide = isFirstSlide && isFirstPage;
  const isLastPageOfLastSlide = isLastSlide && isLastPage;

  // Info o krokach dla scenariusza
  const isFirstStep = isScenarioMode ? (state as { stepIndex: number }).stepIndex === 0 : true;
  const isLastStep = isScenarioMode 
    ? (state as { stepIndex: number; totalSteps: number }).stepIndex === (state as { totalSteps: number }).totalSteps - 1 
    : true;

  return (
    <div className="space-y-6">
      {/* Page/Slide navigation - always visible, disabled for non-text items */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-center text-muted-foreground">
          Nawigacja stron
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-14"
            onClick={onPrevSlide}
            disabled={isNavigating || !isTextItem || isFirstPageOfFirstSlide}
            aria-label="Poprzednia strona/slajd"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="text-center min-w-[150px]">
            {isTextItem && textItem ? (
              <div className="space-y-1">
                <div>
                  <span className="text-2xl font-bold">
                    {textItem.slideIndex + 1}
                  </span>
                  <span className="text-muted-foreground text-lg"> / {textItem.totalSlides}</span>
                  <span className="text-muted-foreground text-sm"> (slajd)</span>
                </div>
                {textItem.totalPages > 1 && (
                  <div>
                    <span className="text-lg font-medium">
                      {textItem.pageIndex + 1}
                    </span>
                    <span className="text-muted-foreground text-sm"> / {textItem.totalPages}</span>
                    <span className="text-muted-foreground text-xs"> (strona)</span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">-</span>
            )}
          </div>
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-14"
            onClick={onNextSlide}
            disabled={isNavigating || !isTextItem || isLastPageOfLastSlide}
            aria-label="Następna strona/slajd"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Step navigation - only for scenario mode */}
      {isScenarioMode && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground">
            Nawigacja elementów scenariusza
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="default"
              className="h-10 px-4"
              onClick={onPrevStep}
              disabled={isNavigating || isFirstStep}
            >
              <SkipBack className="h-4 w-4 mr-2" />
              Poprzedni
            </Button>
            <div className="text-center min-w-[100px]">
              <span className="text-lg font-medium">
                {(state as { stepIndex: number; totalSteps: number }).stepIndex + 1} / {(state as { totalSteps: number }).totalSteps}
              </span>
            </div>
            <Button
              variant="secondary"
              size="default"
              className="h-10 px-4"
              onClick={onNextStep}
              disabled={isNavigating || isLastStep}
            >
              Następny
              <SkipForward className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== SCENARIO STEP ITEM ==========

interface ScenarioStepItemProps {
  step: import('@/types/scenarios').ScenarioStep;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function ScenarioStepItem({ step, index, isActive, onClick }: ScenarioStepItemProps) {
  const stepType = getStepType(step);
  const stepValue = getStepValue(step);
  
  // Extract text ID for fetching text title
  const textRef = stepType === 'text' ? (stepValue as string) : null;
  const textId = textRef ? textRef.split('__').pop() || null : null;
  const { data: textDoc } = useText(textId);

  const StepIcon = getStepStyle(stepType).icon;

  const getStepLabel = () => {
    switch (stepType) {
      case 'text':
        if (textDoc) {
          return textDoc.meta.title;
        }
        // Fallback: extract from textRef
        const parts = (stepValue as string).split('/');
        const filename = parts[parts.length - 1];
        const title = filename.split('__')[0];
        return title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' ');
      case 'image':
      case 'video':
      case 'audio':
        return (stepValue as string).split('/').pop() ?? (stepValue as string);
      case 'heading':
        return stepValue as string;
      case 'qrcode':
        return stepValue as string;
      case 'blank':
        return 'Pusty slajd';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors',
        isActive
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-muted/50'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
        getStepStyle(stepType).color
      )}>
        <StepIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground w-6">
            {index + 1}
          </span>
          <span className={cn(
            'text-sm font-medium truncate',
            isActive && 'text-primary'
          )}>
            {getStepLabel()}
          </span>
        </div>
      </div>
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}
