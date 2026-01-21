import {
  Folder,
  File,
  Image,
  Video,
  Music,
  FileText,
  FileCode,
  MoreVertical,
  ListPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { FileNode, FileKind } from '@/types/files';

interface FileItemProps {
  file: FileNode;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onAddToScenario?: () => void;
}

function getFileIcon(file: FileNode) {
  if (file.isDir) {
    return <Folder className="h-5 w-5 text-blue-400" />;
  }

  const iconMap: Record<FileKind, React.ReactNode> = {
    image: <Image className="h-5 w-5 text-green-400" />,
    video: <Video className="h-5 w-5 text-purple-400" />,
    audio: <Music className="h-5 w-5 text-pink-400" />,
    document: <FileText className="h-5 w-5 text-orange-400" />,
    text: <FileCode className="h-5 w-5 text-cyan-400" />,
    other: <File className="h-5 w-5 text-muted-foreground" />,
  };

  return iconMap[file.kind ?? 'other'];
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Check if file is a media file that can be added to scenario
function isMediaFile(file: FileNode): boolean {
  if (file.isDir) return false;
  return file.kind === 'image' || file.kind === 'video' || file.kind === 'audio';
}

export function FileItem({
  file,
  isSelected,
  onSelect,
  onOpen,
  onRename,
  onDelete,
  onAddToScenario,
}: FileItemProps) {
  const canAddToScenario = isMediaFile(file) && onAddToScenario;

  const menuContent = (
    <ContextMenuContent>
      <ContextMenuItem onClick={onOpen}>
        {file.isDir ? 'Otwórz folder' : 'Otwórz'}
      </ContextMenuItem>
      {canAddToScenario && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onAddToScenario}>
            <ListPlus className="h-4 w-4 mr-2" />
            Dodaj do scenariusza
          </ContextMenuItem>
        </>
      )}
      <ContextMenuSeparator />
      <ContextMenuItem onClick={onRename}>Zmień nazwę</ContextMenuItem>
      <ContextMenuItem onClick={onDelete} className="text-destructive">
        Usuń
      </ContextMenuItem>
    </ContextMenuContent>
  );

  return (
    <>
      {/* Context menu for right-click on the item */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            onClick={onSelect}
            onDoubleClick={onOpen}
            className={cn(
              'group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-md cursor-pointer transition-colors',
              'hover:bg-muted/50 overflow-hidden',
              isSelected && 'bg-muted'
            )}
          >
            {/* Icon */}
            <div className="shrink-0">{getFileIcon(file)}</div>

            {/* Name */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm truncate">{file.name}</p>
            </div>

            {/* Size */}
            {!file.isDir && (
              <div className="hidden sm:block text-xs text-muted-foreground w-16 sm:w-20 text-right shrink-0">
                {formatSize(file.size)}
              </div>
            )}

            {/* Modified date */}
            <div className="hidden md:block text-xs text-muted-foreground w-36 text-right shrink-0">
              {formatDate(file.modifiedAt)}
            </div>

            {/* Actions - dropdown menu for the button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 sm:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onOpen}>
                  {file.isDir ? 'Otwórz folder' : 'Otwórz'}
                </DropdownMenuItem>
                {canAddToScenario && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onAddToScenario}>
                      <ListPlus className="h-4 w-4 mr-2" />
                      Dodaj do scenariusza
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRename}>Zmień nazwę</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  Usuń
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ContextMenuTrigger>
        {menuContent}
      </ContextMenu>
    </>
  );
}

