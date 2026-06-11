import { useEffect } from 'react';
import { useScreenState } from '@/hooks/usePlayer';
import { useSettings } from '@/hooks/useSettings';
import { navigateSlide, navigateStep } from '@/api/player';
import { useRegisterSocketRole } from '@/hooks/useSocket';
import { SlideRenderer } from '@/components/display/SlideRenderer';
import { DEFAULT_SETTINGS } from '@/types/settings';

export function ScreenDisplay() {
  // Updates via WebSocket; polling fallback keeps the public screen fresh if the socket dies
  const { data: screenState } = useScreenState({ pollingFallback: true });
  const { data: settings } = useSettings();

  // Announce this client as a public display so the panel can show "Ekran połączony"
  useRegisterSocketRole('display');

  const state = screenState ?? { mode: 'empty' as const };
  const displaySettings = settings?.display ?? DEFAULT_SETTINGS.display;

  // Pilot do prezentacji (USB klikер = PageUp/PageDown/strzałki).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          void navigateSlide('next');
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          void navigateSlide('prev');
          break;
        case 'ArrowDown':
          e.preventDefault();
          void navigateStep('next');
          break;
        case 'ArrowUp':
          e.preventDefault();
          void navigateStep('prev');
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Wake Lock — nie pozwól przeglądarce wygasić ekranu podczas mszy
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        const wl = (navigator as Navigator & {
          wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinel> };
        }).wakeLock;
        if (wl) lock = await wl.request('screen');
      } catch {
        /* brak wsparcia / odmowa — ignoruj */
      }
    };
    void request();
    // Po powrocie karty do widoczności odzyskaj blokadę
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release().catch(() => {});
    };
  }, []);

  // Opcjonalny fullscreen: ?fullscreen w URL lub kliknięcie ekranu
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('fullscreen')) {
      void document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const handleClick = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden cursor-none"
      style={{ backgroundColor: displaySettings.backgroundColor }}
      onClick={handleClick}
    >
      <SlideRenderer state={state} displaySettings={displaySettings} />
    </div>
  );
}
