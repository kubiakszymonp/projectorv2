import { useEffect, useRef, useState } from 'react';
import { FormField, ColorInput, NumberInput, SelectInput } from './SettingsFormFields';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { SlideRenderer } from '@/components/display/SlideRenderer';
import type { ProjectorSettings, TextAlign } from '@/types/settings';
import type { ScreenState } from '@/types/player';

const TEXT_ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Do lewej' },
  { value: 'center', label: 'Wyśrodkowany' },
  { value: 'right', label: 'Do prawej' },
];

const BLANK_SCREEN_OPTIONS = [
  { value: 'black', label: 'Czarny ekran' },
  { value: 'clock', label: 'Zegar' },
  { value: 'logo', label: 'Logo (z pliku)' },
];

const FONT_FAMILY_OPTIONS = [
  'Arial, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Verdana, sans-serif',
  'Trebuchet MS, sans-serif',
  'Courier New, monospace',
  'Tahoma, sans-serif',
  'Palatino Linotype, serif',
];

type DisplaySettingsTabProps = {
  settings: ProjectorSettings;
  onDisplayChange: <K extends keyof ProjectorSettings['display']>(
    key: K,
    value: ProjectorSettings['display'][K]
  ) => void;
  onPaddingChange: (key: keyof ProjectorSettings['display']['padding'], value: number) => void;
};

export function DisplaySettingsTab({
  settings,
  onDisplayChange,
  onPaddingChange,
}: DisplaySettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Typography Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Typografia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Rozmiar czcionki" description="Wielkość tekstu w pikselach">
            <div className="flex items-center gap-3">
              <Slider
                value={[settings.display.fontSize]}
                min={12}
                max={200}
                step={1}
                onValueChange={([v]) => onDisplayChange('fontSize', v)}
                className="flex-1"
              />
              <span className="text-sm tabular-nums w-12 text-right text-muted-foreground">
                {settings.display.fontSize}px
              </span>
            </div>
          </FormField>

          <FormField label="Czcionka" description="Rodzina czcionek">
            <SelectInput
              value={settings.display.fontFamily}
              onChange={(v) => onDisplayChange('fontFamily', v)}
              options={FONT_FAMILY_OPTIONS.map((f) => ({ value: f, label: f.split(',')[0] }))}
            />
          </FormField>

          <FormField label="Wysokość linii" description="Interlinia (1.0 = normalna)">
            <NumberInput
              value={settings.display.lineHeight}
              onChange={(v) => onDisplayChange('lineHeight', v)}
              min={0.8}
              max={3}
              step={0.1}
            />
          </FormField>

          <FormField label="Odstęp między literami" description="W pikselach">
            <NumberInput
              value={settings.display.letterSpacing}
              onChange={(v) => onDisplayChange('letterSpacing', v)}
              min={-5}
              max={20}
              step={0.5}
              unit="px"
            />
          </FormField>

          <FormField label="Wyrównanie tekstu">
            <SelectInput
              value={settings.display.textAlign}
              onChange={(v) => onDisplayChange('textAlign', v as TextAlign)}
              options={TEXT_ALIGN_OPTIONS}
            />
          </FormField>
        </div>
      </div>

      {/* Text Formatting Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Formatowanie tekstu (Prompter)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="Maksymalna liczba linii na stronę" 
            description="Ile linii tekstu mieści się na jednej stronie"
          >
            <NumberInput
              value={settings.display.maxLinesPerPage}
              onChange={(v) => onDisplayChange('maxLinesPerPage', v)}
              min={1}
              max={50}
            />
          </FormField>

          <FormField
            label="Maksymalna liczba znaków w linii"
            description="Maksymalna długość pojedynczej linii tekstu"
          >
            <NumberInput
              value={settings.display.maxCharsPerLine}
              onChange={(v) => onDisplayChange('maxCharsPerLine', v)}
              min={10}
              max={200}
            />
          </FormField>

          <FormField
            label="Numer strony na ekranie"
            description="Pokaż numer strony na ekranie publicznym (zwykle zbędne)"
          >
            <Switch
              checked={settings.display.showPageNumber}
              onCheckedChange={(v) => onDisplayChange('showPageNumber', v)}
            />
          </FormField>

          <FormField
            label="Auto-dopasowanie tekstu"
            description="Skaluj czcionkę, aby strona zawsze mieściła się na ekranie"
          >
            <Switch
              checked={settings.display.autoFitText}
              onCheckedChange={(v) => onDisplayChange('autoFitText', v)}
            />
          </FormField>
        </div>
      </div>

      {/* Colors Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Kolory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Kolor tła" description="Tło ekranu projektora">
            <ColorInput
              value={settings.display.backgroundColor}
              onChange={(v) => onDisplayChange('backgroundColor', v)}
            />
          </FormField>

          <FormField label="Kolor tekstu" description="Kolor wyświetlanego tekstu">
            <ColorInput
              value={settings.display.textColor}
              onChange={(v) => onDisplayChange('textColor', v)}
            />
          </FormField>
        </div>

        {/* Live preview — ten sam SlideRenderer co na ekranie */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Podgląd na żywo:</p>
          <LivePreview settings={settings.display} />
        </div>
      </div>

      {/* Blank Screen Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Pusty ekran
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Gdy nic nie wyświetlane" description="Co pokazać zamiast czarnego ekranu">
            <SelectInput
              value={settings.display.blankScreen}
              onChange={(v) => onDisplayChange('blankScreen', v as 'black' | 'clock' | 'logo')}
              options={BLANK_SCREEN_OPTIONS}
            />
          </FormField>

          {settings.display.blankScreen === 'logo' && (
            <FormField label="Ścieżka do logo" description="Plik z folderu media (np. ogloszenia/logo.png)">
              <input
                type="text"
                value={settings.display.blankLogoPath}
                onChange={(e) => onDisplayChange('blankLogoPath', e.target.value)}
                placeholder="ogloszenia/logo.png"
                className="w-full px-3 py-2 rounded-md bg-muted/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
          )}
        </div>
      </div>

      {/* Padding Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Marginesy wewnętrzne
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField label="Góra">
            <NumberInput
              value={settings.display.padding.top}
              onChange={(v) => onPaddingChange('top', v)}
              min={0}
              max={200}
              unit="px"
            />
          </FormField>

          <FormField label="Prawo">
            <NumberInput
              value={settings.display.padding.right}
              onChange={(v) => onPaddingChange('right', v)}
              min={0}
              max={200}
              unit="px"
            />
          </FormField>

          <FormField label="Dół">
            <NumberInput
              value={settings.display.padding.bottom}
              onChange={(v) => onPaddingChange('bottom', v)}
              min={0}
              max={200}
              unit="px"
            />
          </FormField>

          <FormField label="Lewo">
            <NumberInput
              value={settings.display.padding.left}
              onChange={(v) => onPaddingChange('left', v)}
              min={0}
              max={200}
              unit="px"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}



const PREVIEW_STATE: ScreenState = {
  mode: 'single',
  visible: true,
  item: {
    type: 'text',
    textRef: 'preview',
    slideIndex: 0,
    totalSlides: 1,
    pageIndex: 0,
    totalPages: 1,
    slideContent: 'Przykładowy tekst\nz kilku linii\ndo podglądu ustawień',
  },
};

function LivePreview({ settings }: { settings: ProjectorSettings['display'] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const update = () => {
      if (ref.current) setScale(ref.current.offsetWidth / 1920);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      ref={ref}
      className="w-full max-w-xl rounded-lg overflow-hidden border bg-black"
      style={{ aspectRatio: '1920/1080' }}
    >
      <div
        style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundColor: settings.backgroundColor,
        }}
      >
        <SlideRenderer state={PREVIEW_STATE} displaySettings={settings} preview />
      </div>
    </div>
  );
}
