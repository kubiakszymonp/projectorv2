import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Monitor,
  Wifi,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettings, useUpdateSettings, useResetSettings } from '@/hooks/useSettings';
import { useSetQRCode, useClearScreen, useScreenState } from '@/hooks/usePlayer';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { DisplaySettingsTab } from '@/components/settings/DisplaySettingsTab';
import { WifiSettingsTab } from '@/components/settings/WifiSettingsTab';
import type { ProjectorSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

type SectionId = 'display' | 'wifi';

export function Settings() {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(['display', 'wifi']));
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

  const toggleSection = useCallback((sectionId: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

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
      <SettingsHeader
        isDirty={isDirty}
        saveSuccess={saveSuccess}
        isSaving={updateSettings.isPending}
        isResetting={resetSettings.isPending}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <ScrollArea className="h-full">
          <div className="p-4 sm:p-6 max-w-3xl">
            {/* Display Settings Accordion */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('display')}
                className="w-full p-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Wyświetlanie</span>
                </div>
                {openSections.has('display') ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {openSections.has('display') && (
                <div className="p-4 bg-muted/10">
                  <DisplaySettingsTab
                    settings={localSettings}
                    onDisplayChange={handleDisplayChange}
                    onPaddingChange={handlePaddingChange}
                  />
                </div>
              )}
            </div>

            {/* WiFi Settings Accordion */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('wifi')}
                className="w-full p-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">WiFi</span>
                </div>
                {openSections.has('wifi') ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {openSections.has('wifi') && (
                <div className="p-4 bg-muted/10">
                  <WifiSettingsTab
                    settings={localSettings}
                    onWifiChange={handleWifiChange}
                    showQRCodes={showQRCodes}
                    qrTab={qrTab}
                    onShowQRCodesChange={setShowQRCodes}
                    onQrTabChange={setQrTab}
                    onSetQRCode={(data) => setQRCode.mutate(data)}
                    onClearScreen={() => clearScreen.mutate()}
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
