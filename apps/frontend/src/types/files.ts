// ========== FILES DOMAIN ==========

export type FileKind = "image" | "video" | "audio" | "document" | "text" | "other";

export type FileNode = {
  path: string;        // np. "media/ogloszenia/2026-01-20.jpg"
  name: string;        // "2026-01-20.jpg"
  isDir: boolean;
  kind?: FileKind;     // tylko jeśli plik
  size?: number;       // bytes
  modifiedAt?: string; // ISO
};

export type FileListResponse = {
  path: string;
  items: FileNode[];
};

export type FolderTreeNode = {
  path: string;
  name: string;
};

export type FolderTreeResponse = {
  path: string;
  folders: FolderTreeNode[];
};

export type FileUploadResponse = {
  node: FileNode;
};

