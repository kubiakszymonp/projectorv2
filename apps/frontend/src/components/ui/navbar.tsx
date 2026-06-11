import {
  Home,
  Monitor,
  ListOrdered,
  Music,
  Image,
  FolderOpen,
  Settings,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Start', icon: Home, exact: true },
  { path: '/screen', label: 'Sterowanie', icon: Monitor },
  { path: '/scenarios', label: 'Scenariusze', icon: ListOrdered },
  { path: '/songs', label: 'Pieśni', icon: Music },
  { path: '/media', label: 'Media', icon: Image },
  { path: '/files', label: 'Pliki', icon: FolderOpen },
  { path: '/settings', label: 'Ustawienia', icon: Settings },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show navbar on home page
  if (location.pathname === '/') {
    return null;
  }

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

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
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
