// ========== SONGS DOMAIN ==========

export type SongId = string;

export type SongMeta = {
  schemaVersion: 1;
  id: string; // ULID
  title: string;
  description: string;
  categories: string[];
};

export type SongDoc = {
  meta: SongMeta;
  contentRaw: string;
  slides: string[];
};

