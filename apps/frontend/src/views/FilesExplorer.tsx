import { useState, useCallback, useEffect } from 'react';
import {
  FolderPlus,
  Upload,
  RefreshCw,
  Loader2,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileTree } from '@/components/files/FileTree';
import { FileList } from '@/components/files/FileList';
import { Breadcrumb } from '@/components/files/Breadcrumb';
import { TextEditorModal, FilePreviewModal } from '@/components/files/TextEditor';
import { RenameDialog } from '@/components/files/dialogs/RenameDialog';
import { CreateFolderDialog } from '@/components/files/dialogs/CreateFolderDialog';
import { DeleteDialog } from '@/components/files/dialogs/DeleteDialog';
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
  // State - nawigacja
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State - otwarty plik (modal)
  const [openFile, setOpenFile] = useState<OpenFile | null>(null);

  // State - dialogi
  const [renameTarget, setRenameTarget] = useState<FileNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileNode | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  // State - add to scenario
  const [addToScenarioFile, setAddToScenarioFile] = useState<FileNode | null>(null);

  // Initialize with initial path
  useEffect(() => {
    if (initialPath) {
      setCurrentPath(initialPath);
      // Auto-expand parent folders
      const parts = initialPath.split('/');
      const newExpanded = new Set<string>();
      let current = '';
      for (const part of parts) {
        current = current ? `${current}/${part}` : part;
        newExpanded.add(current);
      }
      setExpandedFolders(newExpanded);
    }
  }, [initialPath]);

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
  }, [expandedFolders]);

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
    }
  }, [handleSelectFolder]);

  const handleCloseFile = useCallback(() => {
    setOpenFile(null);
  }, []);

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

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-2 sm:px-4 py-3 border-b">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
            <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoadingFiles}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingFiles ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </header>

        {/* Main */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar - drzewo folderów */}
          {sidebarOpen && (
            <aside className="w-64 border-r flex flex-col bg-muted/20">
              <div className="p-2 border-b">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setCreateFolderOpen(true)}
                    >
                      <FolderPlus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Nowy folder</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nowy folder</p>
                  </TooltipContent>
                </Tooltip>
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
            <div className="flex items-center gap-2 px-2 sm:px-4 py-2 border-b overflow-hidden">
              <div className="flex-1 min-w-0">
                <Breadcrumb path={currentPath} onNavigate={handleSelectFolder} />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleUpload}>
                    <Upload className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateFolderOpen(true)}
                  >
                    <FolderPlus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Folder</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nowy folder</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* File list */}
            <div className="flex-1 flex flex-col min-h-0">
              {isLoadingFiles ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <FileList
                  files={fileList?.items ?? []}
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
