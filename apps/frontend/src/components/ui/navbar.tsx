import {
  Home,
  Monitor,
  ListOrdered,
  Music,
  Image,
  FolderOpen,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';

const NAV_ITEMS = [
  { path: '/', label: 'Start', icon: Home, exact: true },
  { path: '/screen', label: 'Sterowanie', icon: Monitor },
  { path: '/scenarios', label: 'Scenariusze', icon: ListOrdered },
  { path: '/songs', label: 'Pieśni', icon: Music },
  { path: '/media', label: 'Media', icon: Image },
  { path: '/files', label: 'Pliki', icon: FolderOpen },
  { path: '/settings', label: 'Ustawienia', icon: Settings },
];

// Na mobile pierwsze 5 w bottom bar, reszta w "Więcej"
const MOBILE_PRIMARY = NAV_ITEMS.slice(0, 5);
const MOBILE_SECONDARY = NAV_ITEMS.slice(5);

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);

  // Don't show navbar on home page
  if (location.pathname === '/') {
    return null;
  }

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const isSecondaryActive = MOBILE_SECONDARY.some((item) => isActive(item));

  if (isMobile) {
    return (
      <>
        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
          <div className="flex items-stretch h-16">
            {MOBILE_PRIMARY.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.path}
                  onClick={() => { setMoreOpen(false); navigate(item.path); }}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-w-0 px-1',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={cn('h-5 w-5', active && 'text-primary')} />
                  <span className="truncate w-full text-center leading-tight">{item.label}</span>
                </button>
              );
            })}
            {/* Więcej */}
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-w-0 px-1',
                (moreOpen || isSecondaryActive) ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="truncate w-full text-center leading-tight">Więcej</span>
            </button>
          </div>
        </nav>

        {/* Więcej panel */}
        {moreOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setMoreOpen(false)}
            />
            <div className="fixed bottom-16 right-0 z-50 bg-background border rounded-tl-lg shadow-xl w-48 p-2">
              {MOBILE_SECONDARY.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <button
                    key={item.path}
                    onClick={() => { setMoreOpen(false); navigate(item.path); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                      active
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop — top nav z pełnymi podpisami
  return (
    <nav className="border-b bg-background">
      <div className="flex items-center h-14 px-2 sm:px-4 gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium shrink-0 transition-colors',
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
