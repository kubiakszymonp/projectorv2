import matter from 'gray-matter';
import { SongDoc, SongMeta } from '../../types';

export class SongParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SongParseError';
  }
}

function validateSongMeta(data: unknown): SongMeta {
  if (!data || typeof data !== 'object') {
    throw new SongParseError('Invalid YAML front matter');
  }

  const meta = data as Record<string, unknown>;

  if (meta.schemaVersion !== 1) {
    throw new SongParseError('Invalid or missing schemaVersion');
  }

  if (typeof meta.id !== 'string' || !meta.id) {
    throw new SongParseError('Invalid or missing id');
  }

  if (typeof meta.title !== 'string' || !meta.title) {
    throw new SongParseError('Invalid or missing title');
  }

  if (typeof meta.description !== 'string') {
    throw new SongParseError('Invalid description (must be string)');
  }

  if (!Array.isArray(meta.categories) || !meta.categories.every((c) => typeof c === 'string')) {
    throw new SongParseError('Invalid categories (must be string array)');
  }

  return {
    schemaVersion: 1,
    id: meta.id,
    title: meta.title,
    description: meta.description,
    categories: meta.categories,
  };
}

function splitByBlankLines(content: string): string[] {
  return content
    .split(/\n\s*\n+/)
    .map((slide) => slide.trim())
    .filter((slide) => slide.length > 0);
}

export function parseSongFile(content: string): SongDoc {
  const { data, content: body } = matter(content);

  const meta = validateSongMeta(data);
  const contentRaw = body.trim();
  const slides = splitByBlankLines(contentRaw);

  return {
    meta,
    contentRaw,
    slides,
  };
}

