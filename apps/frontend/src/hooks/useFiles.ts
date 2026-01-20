import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as filesApi from '@/api/files';

/** Query keys */
export const filesKeys = {
  all: ['files'] as const,
  list: (path: string) => [...filesKeys.all, 'list', path] as const,
  tree: () => [...filesKeys.all, 'tree'] as const,
  content: (path: string) => [...filesKeys.all, 'content', path] as const,
};

/** Hook do listowania plików w folderze */
export function useFileList(path: string) {
  return useQuery({
    queryKey: filesKeys.list(path),
    queryFn: () => filesApi.listFiles(path),
  });
}

/** Hook do pobierania drzewa folderów */
export function useFolderTree() {
  return useQuery({
    queryKey: filesKeys.tree(),
    queryFn: filesApi.getFolderTree,
  });
}

/** Hook do pobierania zawartości pliku */
export function useFileContent(path: string | null) {
  return useQuery({
    queryKey: filesKeys.content(path ?? ''),
    queryFn: () => filesApi.getFileContent(path!),
    enabled: !!path,
  });
}

/** Hook do tworzenia folderu */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (path: string) => filesApi.createFolder(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesKeys.all });
    },
  });
}

/** Hook do zmiany nazwy */
export function useRenameFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path, newName }: { path: string; newName: string }) =>
      filesApi.renameFile(path, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesKeys.all });
    },
  });
}

/** Hook do usuwania */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (path: string) => filesApi.deleteFile(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesKeys.all });
    },
  });
}

/** Hook do uploadu */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderPath, file }: { folderPath: string; file: File }) =>
      filesApi.uploadFile(folderPath, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesKeys.all });
    },
  });
}

/** Hook do zapisywania pliku tekstowego */
export function useSaveFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      filesApi.saveFile(path, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: filesKeys.content(variables.path) });
    },
  });
}

