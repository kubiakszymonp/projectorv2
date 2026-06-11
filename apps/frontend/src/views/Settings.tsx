import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Monitor,
  Wifi,
  Loader2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccordionSection } from '@/components/settings/AccordionSection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSettings, useUpdateSettings, useResetSettings } from '@/hooks/useSettings';
import { useSetQRCode, useClearScreen, useScreenState } from '@/hooks/usePlayer';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { DisplaySettingsTab } from '@/components/settings/DisplaySettingsTab';
import { WifiSettingsTab } from '@/components/settings/WifiSettingsTab';
import { SystemStatusSection } from '@/components/settings/SystemStatusSection';
import { BackupSection } from '@/components/settings/BackupSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import type { ProjectorSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

type SectionId = 'display' | 'wifi' | 'system';

export function Settings() {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(['display']));
  const [localSettings, setLocalSettings] = useState<ProjectorSettings>(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [qrTab, setQrTab] = useState<'wifi' | 'url'>('wifi');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

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

  const handleReset = useCallback(() => {
    setResetConfirmOpen(true);
  }, []);

  const doReset = useCallback(async () => {
    try {
      await resetSettings.mutateAsync();
      setIsDirty(false);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to reset settings:', err);
    } finally {
      setResetConfirmOpen(false);
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
      <div className="app-page flex flex-col bg-background">
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
      <div className="app-page flex flex-col bg-background">
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
    <div className="app-page flex flex-col bg-background">
      <SettingsHeader
        isDirty={isDirty}
        saveSuccess={saveSuccess}
        isSaving={updateSettings.isPending}
        isResetting={resetSettings.isPending}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 max-w-3xl w-full overflow-x-hidden">
          <AccordionSection
            icon={Monitor}
            title="Wyświetlanie"
            open={openSections.has('display')}
            onToggle={() => toggleSection('display')}
          >
            <DisplaySettingsTab
              settings={localSettings}
              onDisplayChange={handleDisplayChange}
              onPaddingChange={handlePaddingChange}
            />
          </AccordionSection>

          <AccordionSection
            icon={Wifi}
            title="WiFi"
            open={openSections.has('wifi')}
            onToggle={() => toggleSection('wifi')}
          >
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
          </AccordionSection>

          <AccordionSection
            icon={Activity}
            title="System"
            open={openSections.has('system')}
            onToggle={() => toggleSection('system')}
          >
            <SystemStatusSection />
            <BackupSection />
            <SecuritySection />
          </AccordionSection>
        </div>
      </main>

      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przywrócić domyślne ustawienia?</DialogTitle>
            <DialogDescription>
              Wszystkie ustawienia wyświetlania i WiFi zostaną przywrócone do
              wartości domyślnych. Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={doReset}
              disabled={resetSettings.isPending}
            >
              {resetSettings.isPending ? 'Przywracanie…' : 'Przywróć'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
