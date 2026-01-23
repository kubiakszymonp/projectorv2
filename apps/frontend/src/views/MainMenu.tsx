import { Monitor, Music, ListOrdered, Image, FolderOpen, Settings, ArrowRight, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

type MenuItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  iconColor: string;
  iconBg: string;
};

const menuItems: MenuItem[] = [
  {
    id: 'screen-control',
    title: 'Sterowanie ekranem',
    description: 'Zarządzaj wyświetlaniem i prezentacją',
    icon: Monitor,
    path: '/screen',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
  },
  {
    id: 'scenarios',
    title: 'Scenariusze',
    description: 'Twórz i edytuj playlisty prezentacji',
    icon: ListOrdered,
    path: '/scenarios',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
  },
  {
    id: 'songs',
    title: 'Katalog pieśni',
    description: 'Przeglądaj i edytuj pieśni z metadanymi',
    icon: Music,
    path: '/songs',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
  },
  {
    id: 'media',
    title: 'Media',
    description: 'Zarządzaj obrazami, filmami i dźwiękami',
    icon: Image,
    path: '/media',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10 group-hover:bg-pink-500/20',
  },
  {
    id: 'files',
    title: 'Edytor plików',
    description: 'Niskopoziomowy dostęp do plików i konfiguracji',
    icon: FolderOpen,
    path: '/files',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
  },
  {
    id: 'settings',
    title: 'Konfiguracja',
    description: 'Ustawienia aplikacji',
    icon: Settings,
    path: '/settings',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
  },
];

export function MainMenu() {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Projektor
          </h1>
          <p className="text-xl text-muted-foreground">
            System zarządzania prezentacjami i multimediami
          </p>
        </div>

        {/* Screen Display Card */}
        <div className="mb-8 max-w-4xl">
          <Card
            className="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:border-foreground/20 bg-card"
            onClick={() => navigate('/display')}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors duration-200">
                  <Tv className="w-6 h-6 text-indigo-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    Ekran wyświetlania
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Podgląd tego, co jest wyświetlane na ekranie
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:border-foreground/20 bg-card"
                onClick={() => handleCardClick(item.path)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg ${item.iconBg} flex items-center justify-center transition-colors duration-200`}
                    >
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                        {item.title}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

