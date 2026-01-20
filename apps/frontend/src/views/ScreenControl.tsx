import { useState } from 'react';
import { Monitor, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ScreenControl() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-3 border-b">
        <Monitor className="h-5 w-5 text-blue-400" />
        <h1 className="text-lg font-semibold">Sterowanie ekranem</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Preview Card */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Podgląd ekranu</h2>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border">
                <p className="text-muted-foreground">Brak aktywnej prezentacji</p>
              </div>
            </div>
          </Card>

          {/* Controls Card */}
          <Card>
            <div className="p-4 border-b">
              <h2 className="font-semibold">Kontrola</h2>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  className="h-16 w-16"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ml-0.5" />
                  )}
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Status Card */}
          <Card>
            <div className="p-4 border-b">
              <h2 className="font-semibold">Status</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Stan:</span>
                  <span className="font-medium">
                    {isPlaying ? (
                      <span className="text-emerald-400">Odtwarzanie</span>
                    ) : (
                      <span>Zatrzymany</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ekran:</span>
                  <span className="font-medium text-muted-foreground">Niepodłączony</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

