import { FormField, ColorInput, NumberInput, SelectInput } from './SettingsFormFields';
import type { ProjectorSettings, TextAlign } from '@/types/settings';

const TEXT_ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Do lewej' },
  { value: 'center', label: 'Wyśrodkowany' },
  { value: 'right', label: 'Do prawej' },
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
            <NumberInput
              value={settings.display.fontSize}
              onChange={(v) => onDisplayChange('fontSize', v)}
              min={12}
              max={200}
              unit="px"
            />
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

        {/* Preview */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Podgląd:</p>
          <div
            className="rounded-lg p-6 text-center border"
            style={{
              backgroundColor: settings.display.backgroundColor,
              color: settings.display.textColor,
              fontFamily: settings.display.fontFamily,
              fontSize: `${Math.min(settings.display.fontSize / 2, 32)}px`,
              lineHeight: settings.display.lineHeight,
              letterSpacing: `${settings.display.letterSpacing}px`,
              textAlign: settings.display.textAlign,
            }}
          >
            Przykładowy tekst
          </div>
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


