import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FolderPlus,
  FolderOpen,
  Upload,
  RefreshCw,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FileTree } from '@/components/files/FileTree';
import { FileList } from '@/components/files/FileList';
import { Breadcrumb } from '@/components/files/Breadcrumb';
import { TextEditorModal, FilePreviewModal } from '@/components/files/TextEditor';
import { RenameDialog } from '@/components/files/dialogs/RenameDialog';
import { CreateFolderDialog } from '@/components/files/dialogs/CreateFolderDialog';
import { DeleteDialog } from '@/components/files/dialogs/DeleteDialog';
import { TrashDialog } from '@/components/files/dialogs/TrashDialog';
import { AddToScenarioModal } from '@/components/scenarios/AddToScenarioModal';
import {
  useFileList,
  useFolderTree,
  useCreateFolder,
  useRenameFile,
  useDeleteFile,
  useUploadFile,
  useSaveFile,
} from '@/hooks/useFiles';
import { useSetMedia } from '@/hooks/usePlayer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { checkPathType } from '@/api/files';
import { cn } from '@/lib/utils';
import type { FileNode } from '@/types/files';
import type { ScenarioStep } from '@/types/scenarios';

type OpenFile = {
  path: string;
  kind: string;
  isEditable: boolean;
};

type FilesExplorerProps = {
  initialPath?: string;
  title?: string;
};

/**
 * Create a scenario step from a media file
 */
function createMediaStep(file: FileNode): ScenarioStep | null {
  if (file.isDir) return null;

  switch (file.kind) {
    case 'image':
      return { image: file.path };
    case 'video':
      return { video: file.path };
    case 'audio':
      return { audio: file.path };
    default:
      return null;
  }
}

export function FilesExplorer({ initialPath = '', title = 'Edytor plików' }: FilesExplorerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pathFromUrl = searchParams.get('path') || initialPath;
  const isMobile = useIsMobile();

  // State - nawigacja
  const [currentPath, setCurrentPath] = useState(pathFromUrl);
  const [search, setSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State - otwarty plik (modal)
  const [openFile, setOpenFile] = useState<OpenFile | null>(null);

  // State - dialogi
  const [renameTarget, setRenameTarget] = useState<FileNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileNode | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);

  // State - add to scenario
  const [addToScenarioFile, setAddToScenarioFile] = useState<FileNode | null>(null);

  // Initialize with path from URL or initial path
  useEffect(() => {
    const pathToUse = pathFromUrl || initialPath;
    if (pathToUse) {
      // Check with backend if path is a file or folder
      checkPathType(pathToUse)
        .then(({ isDir }: { isDir: boolean }) => {
          if (isDir) {
            // It's a folder
            setCurrentPath(pathToUse);
            // Auto-expand parent folders
            const parts = pathToUse.split('/').filter(Boolean);
            const newExpanded = new Set<string>();
            let current = '';
            for (const part of parts) {
              current = current ? `${current}/${part}` : part;
              newExpanded.add(current);
            }
            setExpandedFolders(newExpanded);
          } else {
            // It's a file - extract parent folder and open file
            const parentFolder = pathToUse.substring(0, pathToUse.lastIndexOf('/'));
            setCurrentPath(parentFolder);

            // Determine file kind from extension
            const fileName = pathToUse.split('/').pop() || '';
            const extension = fileName.split('.').pop()?.toLowerCase() || '';
            const isEditable = ['md', 'txt', 'yaml', 'yml', 'json', 'html', 'css', 'js', 'ts'].includes(extension);
            setOpenFile({
              path: pathToUse,
              kind: extension === 'md' || extension === 'txt' ? 'text' : 'other',
              isEditable,
            });

            // Auto-expand parent folders
            const parts = parentFolder.split('/').filter(Boolean);
            const newExpanded = new Set<string>();
            let current = '';
            for (const part of parts) {
              current = current ? `${current}/${part}` : part;
              newExpanded.add(current);
            }
            setExpandedFolders(newExpanded);
          }
        })
        .catch(() => {
          // If check fails, assume it's a folder (fallback)
          setCurrentPath(pathToUse);
        });
    }
  }, [pathFromUrl, initialPath]);

  // Update URL when path or open file changes
  useEffect(() => {
    // If file is open, use file path in URL, otherwise use folder path
    const urlPath = openFile ? openFile.path : currentPath;
    const currentUrlPath = searchParams.get('path') || '';
    
    if (urlPath !== currentUrlPath) {
      if (urlPath) {
        setSearchParams({ path: urlPath }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  }, [currentPath, openFile, searchParams, setSearchParams]);

  // Queries
  const { data: fileList, isLoading: isLoadingFiles, refetch } = useFileList(currentPath);
  const { data: folderTree } = useFolderTree();

  // Mutations
  const createFolder = useCreateFolder();
  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();
  const uploadFile = useUploadFile();
  const saveFile = useSaveFile();
  const setMedia = useSetMedia();

  // Handlers - nawigacja
  const handleSelectFolder = useCallback((path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
    if (isMobile) setSidebarOpen(false);

    // Auto-expand parent folders
    if (path) {
      const parts = path.split('/');
      const newExpanded = new Set(expandedFolders);
      let current = '';
      for (const part of parts.slice(0, -1)) {
        current = current ? `${current}/${part}` : part;
        newExpanded.add(current);
      }
      setExpandedFolders(newExpanded);
    }
  }, [expandedFolders, isMobile]);

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  // Handlers - pliki
  const handleSelectFile = useCallback((file: FileNode) => {
    setSelectedFile(file);
  }, []);

  const handleOpenFile = useCallback((file: FileNode) => {
    if (file.isDir) {
      handleSelectFolder(file.path);
    } else {
      const isEditable = file.kind === 'text';
      setOpenFile({
        path: file.path,
        kind: file.kind ?? 'other',
        isEditable,
      });
      // Update URL with file path
      setSearchParams({ path: file.path }, { replace: true });
    }
  }, [handleSelectFolder, setSearchParams]);

  const handleCloseFile = useCallback(() => {
    setOpenFile(null);
    // Update URL to show folder path instead of file path
    if (currentPath) {
      setSearchParams({ path: currentPath }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [currentPath, setSearchParams]);

  // Handlers - operacje
  const handleCreateFolder = useCallback(async (name: string) => {
    const path = currentPath ? `${currentPath}/${name}` : name;
    await createFolder.mutateAsync(path);
    setCreateFolderOpen(false);
  }, [currentPath, createFolder]);

  const handleRename = useCallback(async (newName: string) => {
    if (!renameTarget) return;
    await renameFile.mutateAsync({ path: renameTarget.path, newName });
    setRenameTarget(null);
  }, [renameTarget, renameFile]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteFile.mutateAsync(deleteTarget.path);
    setDeleteTarget(null);
    if (selectedFile?.path === deleteTarget.path) {
      setSelectedFile(null);
    }
    if (openFile?.path === deleteTarget.path) {
      setOpenFile(null);
    }
  }, [deleteTarget, deleteFile, selectedFile, openFile]);

  const handleUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
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

  const handleSaveFile = useCallback(async (content: string) => {
    if (!openFile) return;
    await saveFile.mutateAsync({ path: openFile.path, content });
  }, [openFile, saveFile]);

  const handleAddToScenario = useCallback((file: FileNode) => {
    setAddToScenarioFile(file);
  }, []);

  const handleCloseAddToScenario = useCallback(() => {
    setAddToScenarioFile(null);
  }, []);

  const handleProjectToScreen = useCallback((file: FileNode) => {
    if (file.isDir) return;
    const mediaType = file.kind as 'image' | 'video' | 'audio';
    if (mediaType === 'image' || mediaType === 'video' || mediaType === 'audio') {
      setMedia.mutate({ type: mediaType, path: file.path });
    }
  }, [setMedia]);

  // Get step for scenario modal
  const scenarioStep = addToScenarioFile ? createMediaStep(addToScenarioFile) : null;

  // Filtruj listę plików po nazwie (bieżący folder)
  const fileQuery = search.trim().toLowerCase();
  const visibleFiles = (fileList?.items ?? []).filter(
    (f) => !fileQuery || f.name.toLowerCase().includes(fileQuery),
  );

  return (
    <TooltipProvider>
      <div className="app-page flex flex-col bg-background">
        {/* Header */}
        <PageHeader
          title={title}
          icon={FolderOpen}
          iconColor="text-purple-400"
          leading={
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
              title="Pokaż/ukryj foldery"
              aria-label="Pokaż/ukryj foldery"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
          }
          actions={[
            {
              key: 'trash',
              label: 'Kosz',
              icon: Trash2,
              onClick: () => setTrashOpen(true),
              variant: 'outline',
            },
            {
              key: 'refresh',
              label: 'Odśwież',
              icon: RefreshCw,
              onClick: () => refetch(),
              variant: 'outline',
              loading: isLoadingFiles,
            },
          ]}
        />

        {/* Main */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Backdrop for mobile drawer */}
          {isMobile && sidebarOpen && (
            <div
              className="absolute inset-0 z-30 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar — inline na desktop, drawer na mobile */}
          {sidebarOpen && (
            <aside className={cn(
              'flex flex-col bg-muted/20 border-r',
              isMobile
                ? 'absolute inset-y-0 left-0 z-40 w-72 shadow-xl'
                : 'w-64'
            )}>
              <div className="p-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setCreateFolderOpen(true)}
                >
                  <FolderPlus className="h-4 w-4" />
                  Nowy folder
                </Button>
              </div>
              <FileTree
                folders={folderTree?.folders ?? []}
                currentPath={currentPath}
                onSelectFolder={handleSelectFolder}
                expandedFolders={expandedFolders}
                onToggleExpand={handleToggleExpand}
              />
            </aside>
          )}

          {/* Content */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="border-b">
              <div className="flex items-center gap-2 px-2 sm:px-4 py-2 overflow-hidden">
                <div className="flex-1 min-w-0">
                  <Breadcrumb path={currentPath} onNavigate={handleSelectFolder} />
                </div>
                <Button variant="outline" size="sm" onClick={handleUpload} className="gap-1.5 shrink-0">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateFolderOpen(true)}
                  className="gap-1.5 shrink-0"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Folder</span>
                </Button>
              </div>
              <div className="px-2 sm:px-4 pb-2">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Szukaj w tym folderze..."
                />
              </div>
            </div>

            {/* File list */}
            <div className="flex-1 flex flex-col min-h-0">
              {isLoadingFiles ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <FileList
                  files={visibleFiles}
                  selectedPath={selectedFile?.path ?? null}
                  onSelectFile={handleSelectFile}
                  onOpenFile={handleOpenFile}
                  onRenameFile={setRenameTarget}
                  onDeleteFile={setDeleteTarget}
                  onAddToScenario={handleAddToScenario}
                  onProjectToScreen={handleProjectToScreen}
                />
              )}
            </div>
          </main>
        </div>

        {/* Modals */}
        <TextEditorModal
          open={!!openFile?.isEditable}
          filePath={openFile?.path ?? ''}
          onClose={handleCloseFile}
          onSave={handleSaveFile}
        />

        <FilePreviewModal
          open={!!openFile && !openFile.isEditable}
          filePath={openFile?.path ?? ''}
          fileKind={openFile?.kind ?? 'other'}
          onClose={handleCloseFile}
        />

        <RenameDialog
          open={!!renameTarget}
          currentName={renameTarget?.name ?? ''}
          isFolder={renameTarget?.isDir ?? false}
          onClose={() => setRenameTarget(null)}
          onConfirm={handleRename}
          isLoading={renameFile.isPending}
        />

        <CreateFolderDialog
          open={createFolderOpen}
          parentPath={currentPath}
          onClose={() => setCreateFolderOpen(false)}
          onConfirm={handleCreateFolder}
          isLoading={createFolder.isPending}
        />

        <DeleteDialog
          open={!!deleteTarget}
          name={deleteTarget?.name ?? ''}
          isFolder={deleteTarget?.isDir ?? false}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isLoading={deleteFile.isPending}
        />

        {/* Trash */}
        <TrashDialog
          open={trashOpen}
          onClose={() => setTrashOpen(false)}
          onRestored={() => refetch()}
        />

        {/* Add to scenario modal */}
        <AddToScenarioModal
          open={!!addToScenarioFile}
          onClose={handleCloseAddToScenario}
          step={scenarioStep}
          itemTitle={addToScenarioFile?.name}
        />
      </div>
    </TooltipProvider>
  );
}
