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
};

