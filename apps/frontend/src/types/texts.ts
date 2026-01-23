// ========== TEXTS DOMAIN ==========

export type TextId = string;

export type TextMeta = {
  schemaVersion: 1;
  id: string; // ULID
  domain: string; // folder name, e.g. "songs", "readings", "psalms"
  title: string;
  description: string;
  categories: string[];
};

export type TextDoc = {
  meta: TextMeta;
  contentRaw: string;
  slides: string[];
  filePath: string; // Relative path from data/ folder, e.g. "texts/songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P.md"
};

