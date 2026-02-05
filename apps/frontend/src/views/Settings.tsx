import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Monitor,
  Wifi,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
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

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('display');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      <div className="flex-1 flex min-h-0 relative">
        {/* Sidebar - Tabs */}
        {sidebarOpen && (
          <aside className="w-48 border-r bg-muted/20 relative">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-1 bg-background border rounded-md hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <nav className="p-2 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        )}
        
        {/* Sidebar Toggle Button - when closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-background border rounded-r-md hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6 max-w-3xl">
              {activeTab === 'display' && (
                <DisplaySettingsTab
                  settings={localSettings}
                  onDisplayChange={handleDisplayChange}
                  onPaddingChange={handlePaddingChange}
                />
              )}
              {activeTab === 'wifi' && (
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
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
