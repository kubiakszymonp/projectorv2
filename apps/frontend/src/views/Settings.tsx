import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Monitor,
  Wifi,
  Save,
  RotateCcw,
  Loader2,
  Check,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSettings, useUpdateSettings, useResetSettings } from '@/hooks/useSettings';
import { useSetQRCode, useClearScreen, useScreenState } from '@/hooks/usePlayer';
import type { ProjectorSettings, TextAlign } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { cn } from '@/lib/utils';

// ========== TYPES ==========

type TabId = 'display' | 'wifi';

type TabConfig = {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const TABS: TabConfig[] = [
  { id: 'display', label: 'Wyświetlanie', icon: Monitor },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
];

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

// ========== COMPONENTS ==========

type FormFieldProps = {
  label: string;
  description?: string;
  children: React.ReactNode;
};

function FormField({ label, description, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

type ColorInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function ColorInput({ value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded border cursor-pointer"
      />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 font-mono text-sm"
        placeholder="#000000"
      />
    </div>
  );
}

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

function NumberInput({ value, onChange, min, max, step = 1, unit }: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1"
      />
      {unit && <span className="text-sm text-muted-foreground w-8">{unit}</span>}
    </div>
  );
}

type SelectInputProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

function SelectInput({ value, onChange, options }: SelectInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-md border bg-background text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ========== MAIN COMPONENT ==========

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('display');
  const [localSettings, setLocalSettings] = useState<ProjectorSettings>(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [qrTab, setQrTab] = useState<'wifi' | 'url'>('wifi');

  // Queries & Mutations
  const { data: serverSettings, isLoading, error } = useSettings();
  const { data: screenState } = useScreenState();
  const updateSettings = useUpdateSettings();
  const resetSettings = useResetSettings();
  const setQRCode = useSetQRCode();
  const clearScreen = useClearScreen();

  // Sync local state with server data
  useEffect(() => {
    if (serverSettings) {
      setLocalSettings(serverSettings);
      setIsDirty(false);
    }
  }, [serverSettings]);

  // Sync showQRCodes with actual screen state
  useEffect(() => {
    if (screenState) {
      const isQRCodeDisplayed = screenState.mode === 'single' && 
                                screenState.item?.type === 'qrcode' && 
                                screenState.visible;
      setShowQRCodes(isQRCodeDisplayed);
    } else {
      setShowQRCodes(false);
    }
  }, [screenState]);

  // Update QR code when WiFi settings change and QR is displayed
  useEffect(() => {
    if (showQRCodes && qrTab === 'wifi') {
      const wifiQRValue = localSettings.wifi.ssid && localSettings.wifi.password
        ? `WIFI:T:WPA;S:${localSettings.wifi.ssid};P:${localSettings.wifi.password};;`
        : '';
      if (wifiQRValue) {
        setQRCode.mutate({
          value: wifiQRValue,
          label: `Połączenie z WiFi: ${localSettings.wifi.ssid}`,
        });
      }
    }
  }, [localSettings.wifi.ssid, localSettings.wifi.password, showQRCodes, qrTab, setQRCode]);

  // Clear success message after delay
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Handlers
  const handleDisplayChange = useCallback(<K extends keyof ProjectorSettings['display']>(
    key: K,
    value: ProjectorSettings['display'][K]
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      display: { ...prev.display, [key]: value },
    }));
    setIsDirty(true);
  }, []);

  const handlePaddingChange = useCallback((key: keyof ProjectorSettings['display']['padding'], value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      display: {
        ...prev.display,
        padding: { ...prev.display.padding, [key]: value },
      },
    }));
    setIsDirty(true);
  }, []);

  const handleWifiChange = useCallback(<K extends keyof ProjectorSettings['wifi']>(
    key: K,
    value: ProjectorSettings['wifi'][K]
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      wifi: { ...prev.wifi, [key]: value },
    }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateSettings.mutateAsync(localSettings);
      setIsDirty(false);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, [localSettings, updateSettings]);

  const handleReset = useCallback(async () => {
    if (!window.confirm('Czy na pewno chcesz przywrócić domyślne ustawienia?')) {
      return;
    }
    try {
      await resetSettings.mutateAsync();
      setIsDirty(false);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to reset settings:', err);
    }
  }, [resetSettings]);

  // Render tab content
  const renderDisplayTab = () => (
    <div className="space-y-6">
      {/* Typography Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Typografia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Rozmiar czcionki" description="Wielkość tekstu w pikselach">
            <NumberInput
              value={localSettings.display.fontSize}
              onChange={(v) => handleDisplayChange('fontSize', v)}
              min={12}
              max={200}
              unit="px"
            />
          </FormField>

          <FormField label="Czcionka" description="Rodzina czcionek">
            <SelectInput
              value={localSettings.display.fontFamily}
              onChange={(v) => handleDisplayChange('fontFamily', v)}
              options={FONT_FAMILY_OPTIONS.map((f) => ({ value: f, label: f.split(',')[0] }))}
            />
          </FormField>

          <FormField label="Wysokość linii" description="Interlinia (1.0 = normalna)">
            <NumberInput
              value={localSettings.display.lineHeight}
              onChange={(v) => handleDisplayChange('lineHeight', v)}
              min={0.8}
              max={3}
              step={0.1}
            />
          </FormField>

          <FormField label="Odstęp między literami" description="W pikselach">
            <NumberInput
              value={localSettings.display.letterSpacing}
              onChange={(v) => handleDisplayChange('letterSpacing', v)}
              min={-5}
              max={20}
              step={0.5}
              unit="px"
            />
          </FormField>

          <FormField label="Wyrównanie tekstu">
            <SelectInput
              value={localSettings.display.textAlign}
              onChange={(v) => handleDisplayChange('textAlign', v as TextAlign)}
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
              value={localSettings.display.backgroundColor}
              onChange={(v) => handleDisplayChange('backgroundColor', v)}
            />
          </FormField>

          <FormField label="Kolor tekstu" description="Kolor wyświetlanego tekstu">
            <ColorInput
              value={localSettings.display.textColor}
              onChange={(v) => handleDisplayChange('textColor', v)}
            />
          </FormField>
        </div>

        {/* Preview */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Podgląd:</p>
          <div
            className="rounded-lg p-6 text-center border"
            style={{
              backgroundColor: localSettings.display.backgroundColor,
              color: localSettings.display.textColor,
              fontFamily: localSettings.display.fontFamily,
              fontSize: `${Math.min(localSettings.display.fontSize / 2, 32)}px`,
              lineHeight: localSettings.display.lineHeight,
              letterSpacing: `${localSettings.display.letterSpacing}px`,
              textAlign: localSettings.display.textAlign,
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
              value={localSettings.display.padding.top}
              onChange={(v) => handlePaddingChange('top', v)}
              min={0}
              max={200}
              unit="px"
            />
          </FormField>

          <FormField label="Prawo">
            <NumberInput
              value={localSettings.display.padding.right}
              onChange={(v) => handlePaddingChange('right', v)}
              min={0}
              max={200}
              unit="px"
            />
          </FormField>

          <FormField label="Dół">
            <NumberInput
              value={localSettings.display.padding.bottom}
              onChange={(v) => handlePaddingChange('bottom', v)}
              min={0}
              max={200}
              unit="px"
            />
          </FormField>

          <FormField label="Lewo">
            <NumberInput
              value={localSettings.display.padding.left}
              onChange={(v) => handlePaddingChange('left', v)}
              min={0}
              max={200}
              unit="px"
            />
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderWifiTab = () => {
    // Generate WiFi QR code string
    const wifiQRValue = localSettings.wifi.ssid && localSettings.wifi.password
      ? `WIFI:T:WPA;S:${localSettings.wifi.ssid};P:${localSettings.wifi.password};;`
      : '';

    // Generate URL QR code string
    const urlQRValue = typeof window !== 'undefined' ? window.location.origin : '';

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sieć WiFi
          </h3>
          <p className="text-sm text-muted-foreground">
            Konfiguracja sieci WiFi dla urządzenia projektora. Umożliwia zdalne połączenie z systemem.
          </p>

          <div className="grid grid-cols-1 gap-4 max-w-md">
            <FormField label="SSID" description="Nazwa sieci WiFi">
              <Input
                type="text"
                value={localSettings.wifi.ssid}
                onChange={(e) => handleWifiChange('ssid', e.target.value)}
                placeholder="Nazwa sieci"
              />
            </FormField>

            <FormField label="Hasło" description="Hasło do sieci WiFi">
              <Input
                type="password"
                value={localSettings.wifi.password}
                onChange={(e) => handleWifiChange('password', e.target.value)}
                placeholder="••••••••"
              />
            </FormField>
          </div>
        </div>

        {/* QR Codes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Kody QR
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Wyświetl kody QR do szybkiego połączenia
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Pokaż kody QR na ekranie</span>
              <Switch
                checked={showQRCodes}
                onCheckedChange={(checked) => {
                  setShowQRCodes(checked);
                  if (checked) {
                    // Set QR code based on active tab
                    if (qrTab === 'wifi' && wifiQRValue) {
                      setQRCode.mutate({
                        value: wifiQRValue,
                        label: `Połączenie z WiFi: ${localSettings.wifi.ssid}`,
                      });
                    } else if (qrTab === 'url' && urlQRValue) {
                      setQRCode.mutate({
                        value: urlQRValue,
                        label: 'Adres aplikacji',
                      });
                    }
                  } else {
                    // Clear screen when disabled
                    clearScreen.mutate();
                  }
                }}
              />
            </div>
          </div>

          {showQRCodes && (
            <Card className="p-6">
              <Tabs value={qrTab} onValueChange={(v) => {
                setQrTab(v as 'wifi' | 'url');
                // Update QR code on screen when tab changes and QR codes are shown
                if (showQRCodes) {
                  if (v === 'wifi' && wifiQRValue) {
                    setQRCode.mutate({
                      value: wifiQRValue,
                      label: `Połączenie z WiFi: ${localSettings.wifi.ssid}`,
                    });
                  } else if (v === 'url' && urlQRValue) {
                    setQRCode.mutate({
                      value: urlQRValue,
                      label: 'Adres aplikacji',
                    });
                  }
                }
              }}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="wifi">
                    <Wifi className="h-4 w-4 mr-2" />
                    WiFi
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <QrCode className="h-4 w-4 mr-2" />
                    Adres
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="wifi" className="space-y-4">
                  {wifiQRValue ? (
                    <>
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <QRCodeSVG
                            value={wifiQRValue}
                            size={256}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Połączenie z WiFi</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Zeskanuj kod, aby połączyć się z siecią {localSettings.wifi.ssid}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Wprowadź SSID i hasło WiFi, aby wygenerować kod QR</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  {urlQRValue ? (
                    <>
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <QRCodeSVG
                            value={urlQRValue}
                            size={256}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Adres aplikacji</p>
                          <p className="text-xs text-muted-foreground mt-1 break-all">
                            {urlQRValue}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Nie można wygenerować kodu QR</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="flex items-center gap-2 px-4 py-3 border-b">
          <SettingsIcon className="h-5 w-5 text-orange-400" />
          <h1 className="text-lg font-semibold">Konfiguracja</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="flex items-center gap-2 px-4 py-3 border-b">
          <SettingsIcon className="h-5 w-5 text-orange-400" />
          <h1 className="text-lg font-semibold">Konfiguracja</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Błąd ładowania</h2>
            <p className="text-muted-foreground">
              Nie udało się załadować ustawień. Sprawdź połączenie z serwerem.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-orange-400" />
          <h1 className="text-lg font-semibold">Konfiguracja</h1>
        </div>

        {/* Save button - always visible */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={resetSettings.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetuj
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || updateSettings.isPending}
            className={cn(
              'min-w-[120px]',
              saveSuccess && 'bg-green-600 hover:bg-green-600'
            )}
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Zapisuję...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Zapisano
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Zapisz{isDirty && ' *'}
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar - Tabs */}
        <aside className="w-48 border-r bg-muted/20">
          <nav className="p-2 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-3xl">
              {activeTab === 'display' && renderDisplayTab()}
              {activeTab === 'wifi' && renderWifiTab()}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
