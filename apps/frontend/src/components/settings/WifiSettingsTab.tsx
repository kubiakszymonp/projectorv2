import { Input } from '@/components/ui/input';
import { FormField } from './SettingsFormFields';
import { QRCodeSection } from './QRCodeSection';
import type { ProjectorSettings } from '@/types/settings';

type WifiSettingsTabProps = {
  settings: ProjectorSettings;
  onWifiChange: <K extends keyof ProjectorSettings['wifi']>(
    key: K,
    value: ProjectorSettings['wifi'][K]
  ) => void;
  showQRCodes: boolean;
  qrTab: 'wifi' | 'url';
  onShowQRCodesChange: (checked: boolean) => void;
  onQrTabChange: (tab: 'wifi' | 'url') => void;
  onSetQRCode: (data: { value: string; label: string }) => void;
  onClearScreen: () => void;
};

export function WifiSettingsTab({
  settings,
  onWifiChange,
  showQRCodes,
  qrTab,
  onShowQRCodesChange,
  onQrTabChange,
  onSetQRCode,
  onClearScreen,
}: WifiSettingsTabProps) {
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
              value={settings.wifi.ssid}
              onChange={(e) => onWifiChange('ssid', e.target.value)}
              placeholder="Nazwa sieci"
            />
          </FormField>

          <FormField label="Hasło" description="Hasło do sieci WiFi">
            <Input
              type="password"
              value={settings.wifi.password}
              onChange={(e) => onWifiChange('password', e.target.value)}
              placeholder="••••••••"
            />
          </FormField>
        </div>
      </div>

      <QRCodeSection
        settings={settings}
        showQRCodes={showQRCodes}
        qrTab={qrTab}
        onShowQRCodesChange={onShowQRCodesChange}
        onQrTabChange={onQrTabChange}
        onSetQRCode={onSetQRCode}
        onClearScreen={onClearScreen}
      />
    </div>
  );
}


