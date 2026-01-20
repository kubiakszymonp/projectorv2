// ========== MEDIA DOMAIN ==========

export type MediaKind = "image" | "video" | "audio" | "document" | "other";

export type MediaNode = {
  path: string;        // np. "ogloszenia/2026-01-20.jpg"
  name: string;        // "2026-01-20.jpg"
  isDir: boolean;
  kind?: MediaKind;    // tylko jeśli plik
  size?: number;       // bytes
  modifiedAt?: string; // ISO
};

export type MediaListResponse = {
  path: string;
  items: MediaNode[];
};

export type MediaTreeFolder = {
  path: string;
  name: string;
};

export type MediaTreeResponse = {
  path: string;
  folders: MediaTreeFolder[];
};

export type MediaUploadResponse = {
  node: MediaNode;
};

