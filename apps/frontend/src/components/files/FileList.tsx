import { FileItem } from './FileItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FileNode } from '@/types/files';

interface FileListProps {
  files: FileNode[];
  selectedPath: string | null;
  onSelectFile: (file: FileNode) => void;
  onOpenFile: (file: FileNode) => void;
  onRenameFile: (file: FileNode) => void;
  onDeleteFile: (file: FileNode) => void;
}

export function FileList({
  files,
  selectedPath,
  onSelectFile,
  onOpenFile,
  onRenameFile,
  onDeleteFile,
}: FileListProps) {
  // Sortuj: foldery na górze, potem alfabetycznie
  const sortedFiles = [...files].sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name, 'pl');
  });

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Folder jest pusty</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {sortedFiles.map((file) => (
          <FileItem
            key={file.path}
            file={file}
            isSelected={selectedPath === file.path}
            onSelect={() => onSelectFile(file)}
            onOpen={() => onOpenFile(file)}
            onRename={() => onRenameFile(file)}
            onDelete={() => onDeleteFile(file)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

