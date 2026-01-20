// ========== MEDIA DOMAIN ==========

export type MediaId = string;

export type MediaMeta = {
  schemaVersion: 1;
  id: string; // ULID
  domain: string; // folder name, e.g. "ogloszenia", "images"
  title: string;
  description: string;
  categories: string[];
  fileName: string;
  fileSize: number;
  mimeType: string;
};
