import { Wifi, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { ProjectorSettings } from '@/types/settings';

type QRCodeSectionProps = {
  settings: ProjectorSettings;
  showQRCodes: boolean;
  qrTab: 'wifi' | 'url';
  onShowQRCodesChange: (checked: boolean) => void;
  onQrTabChange: (tab: 'wifi' | 'url') => void;
  onSetQRCode: (data: { value: string; label: string }) => void;
  onClearScreen: () => void;
};

export function QRCodeSection({
  settings,
  showQRCodes,
  qrTab,
  onShowQRCodesChange,
  onQrTabChange,
  onSetQRCode,
  onClearScreen,
}: QRCodeSectionProps) {
  // Generate WiFi QR code string
  const wifiQRValue = settings.wifi.ssid && settings.wifi.password
    ? `WIFI:T:WPA;S:${settings.wifi.ssid};P:${settings.wifi.password};;`
    : '';

  // Generate URL QR code string
  const urlQRValue = typeof window !== 'undefined' ? window.location.origin : '';

  return (
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
              onShowQRCodesChange(checked);
              if (checked) {
                // Set QR code based on active tab
                if (qrTab === 'wifi' && wifiQRValue) {
                  onSetQRCode({
                    value: wifiQRValue,
                    label: `Połączenie z WiFi: ${settings.wifi.ssid}`,
                  });
                } else if (qrTab === 'url' && urlQRValue) {
                  onSetQRCode({
                    value: urlQRValue,
                    label: 'Adres aplikacji',
                  });
                }
              } else {
                // Clear screen when disabled
                onClearScreen();
              }
            }}
          />
        </div>
      </div>

      {showQRCodes && (
        <Card className="p-6">
          <Tabs value={qrTab} onValueChange={(v) => {
            onQrTabChange(v as 'wifi' | 'url');
            // Update QR code on screen when tab changes and QR codes are shown
            if (showQRCodes) {
              if (v === 'wifi' && wifiQRValue) {
                onSetQRCode({
                  value: wifiQRValue,
                  label: `Połączenie z WiFi: ${settings.wifi.ssid}`,
                });
              } else if (v === 'url' && urlQRValue) {
                onSetQRCode({
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
                        Zeskanuj kod, aby połączyć się z siecią {settings.wifi.ssid}
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
  );
}


