import { Settings as SettingsIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function Settings() {

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-3 border-b">
        <SettingsIcon className="h-5 w-5 text-orange-400" />
        <h1 className="text-lg font-semibold">Konfiguracja</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <SettingsIcon className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Wkrótce</h2>
              <p className="text-muted-foreground">
                Panel konfiguracji jest w trakcie implementacji
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

