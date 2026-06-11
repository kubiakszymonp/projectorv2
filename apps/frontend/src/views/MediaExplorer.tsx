import { useState, useCallback } from 'react';
import {
  Upload,
  RefreshCw,
  Loader2,
  Music,
  Video,
  Image as ImageIcon,
  Monitor,
  ListPlus,
  ChevronRight,
  Home,
  Folder,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { AddToScenarioModal } from '@/components/scenarios/AddToScenarioModal';
import { useFileList, useUploadFile } from '@/hooks/useFiles';
import { useSetMedia } from '@/hooks/usePlayer';
import { getFileUrl } from '@/api/files';
import { cn } from '@/lib/utils';
import type { FileNode } from '@/types/files';
import type { ScenarioStep } from '@/types/scenarios';

function createMediaStep(file: FileNode): ScenarioStep | null {
  if (file.isDir) return null;
  switch (file.kind) {
    case 'image': return { image: file.path };
    case 'video': return { video: file.path };
    case 'audio': return { audio: file.path };
    default: return null;
  }
}

function isMedia(file: FileNode) {
  return !file.isDir && (file.kind === 'image' || file.kind === 'video' || file.kind === 'audio');
}

// ─── Miniatura kafelka ────────────────────────────────────────────────────────

function MediaTile({
  file,
  onProject,
  onAddToScenario,
  onOpenFolder,
}: {
  file: FileNode;
  onProject: (f: FileNode) => void;
  onAddToScenario: (f: FileNode) => void;
  onOpenFolder: (f: FileNode) => void;
}) {
  const [imgError, setImgError] = useState(false);

  if (file.isDir) {
    return (
      <button
        onClick={() => onOpenFolder(file)}
        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors aspect-square text-center"
      >
        <Folder className="h-10 w-10 text-blue-400" />
        <span className="text-xs font-medium truncate w-full">{file.name}</span>
      </button>
    );
  }

  const url = getFileUrl(file.path);

  const thumbnail = () => {
    if (file.kind === 'image' && !imgError) {
      return (
        <img
          src={url}
          alt={file.name}
          className="w-full h-full object-cover rounded-t-lg"
          onError={() => setImgError(true)}
        />
      );
    }
    if (file.kind === 'video') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-t-lg">
          <Video className="h-12 w-12 text-purple-400" />
        </div>
      );
    }
    if (file.kind === 'audio') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-t-lg">
          <Music className="h-12 w-12 text-pink-400" />
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-t-lg">
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-video bg-black overflow-hidden">{thumbnail()}</div>

      {/* Info + akcje */}
      <div className="p-2 flex flex-col gap-1.5">
        <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
        {isMedia(file) && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1"
              onClick={() => onProject(file)}
              title="Rzutuj na ekran"
            >
              <Monitor className="h-3 w-3" />
              <span className="hidden xs:inline">Ekran</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1"
              onClick={() => onAddToScenario(file)}
              title="Dodaj do scenariusza"
            >
              <ListPlus className="h-3 w-3" />
              <span className="hidden xs:inline">Scenariusz</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function MediaBreadcrumb({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate: (p: string) => void;
}) {
  // path relative to 'media', e.g. '' | 'sub' | 'sub/deep'
  const parts = path.replace(/^media\/?/, '').split('/').filter(Boolean);

  return (
    <div className="flex items-center gap-1 text-sm overflow-x-auto">
      <button
        onClick={() => onNavigate('media')}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Home className="h-4 w-4" />
        Media
      </button>
      {parts.map((part, i) => {
        const targetPath = 'media/' + parts.slice(0, i + 1).join('/');
        return (
          <span key={targetPath} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => onNavigate(targetPath)}
              className={cn(
                'transition-colors',
                i === parts.length - 1
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {part}
            </button>
          </span>
        );
      })}
    </div>
  );
}

// ─── Widok główny ─────────────────────────────────────────────────────────────

export function MediaExplorer() {
  const [currentPath, setCurrentPath] = useState('media');
  const [search, setSearch] = useState('');
  const [addToScenarioFile, setAddToScenarioFile] = useState<FileNode | null>(null);

  const { data: fileList, isLoading, refetch } = useFileList(currentPath);
  const uploadFile = useUploadFile();
  const setMedia = useSetMedia();

  const handleProject = useCallback((file: FileNode) => {
    const type = file.kind as 'image' | 'video' | 'audio';
    setMedia.mutate({ type, path: file.path });
  }, [setMedia]);

  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      for (const file of Array.from(files)) {
        await uploadFile.mutateAsync({ folderPath: currentPath, file });
      }
    };
    input.click();
  }, [currentPath, uploadFile]);

  const handleOpenFolder = useCallback((file: FileNode) => {
    setCurrentPath(file.path);
  }, []);

  const scenarioStep = addToScenarioFile ? createMediaStep(addToScenarioFile) : null;

  // Filtruj po nazwie (bieżący folder), potem sortuj: foldery na górze, potem media
  const query = search.trim().toLowerCase();
  const items = [...(fileList?.items ?? [])]
    .filter((f) => !query || f.name.toLowerCase().includes(query))
    .sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name, 'pl');
    });

  return (
    <div className="app-page flex flex-col bg-background">
      {/* Header */}
      <PageHeader
        title="Media"
        icon={ImageIcon}
        iconColor="text-pink-400"
        actions={[
          {
            key: 'refresh',
            label: 'Odśwież',
            icon: RefreshCw,
            onClick: () => refetch(),
            variant: 'outline',
            loading: isLoading,
          },
          {
            key: 'upload',
            label: 'Dodaj media',
            icon: Upload,
            onClick: handleUpload,
            variant: 'default',
            loading: uploadFile.isPending,
          },
        ]}
      />

      {/* Breadcrumb */}
      <div className="px-3 sm:px-4 py-2 border-b shrink-0 space-y-2">
        <MediaBreadcrumb path={currentPath} onNavigate={setCurrentPath} />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Szukaj w tym folderze..."
        />
      </div>

      {/* Grid */}
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
            <ImageIcon className="h-12 w-12 opacity-30" />
            <p className="text-sm">
              {query ? 'Brak mediów pasujących do wyszukiwania' : 'Brak mediów w tym folderze'}
            </p>
            {!query && (
              <Button size="sm" onClick={handleUpload} className="gap-1.5">
                <Upload className="h-4 w-4" />
                Dodaj media
              </Button>
            )}
          </div>
        ) : (
          <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((file) => (
              <MediaTile
                key={file.path}
                file={file}
                onProject={handleProject}
                onAddToScenario={setAddToScenarioFile}
                onOpenFolder={handleOpenFolder}
              />
            ))}
          </div>
        )}
      </main>

      <AddToScenarioModal
        open={!!addToScenarioFile}
        onClose={() => setAddToScenarioFile(null)}
        step={scenarioStep}
        itemTitle={addToScenarioFile?.name}
      />
    </div>
  );
}
