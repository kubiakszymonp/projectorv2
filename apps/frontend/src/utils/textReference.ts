import type { TextDoc } from '@/types/texts';

/**
 * Tworzy referencję do tekstu dla scenariusza
 * Format: domain/slug__id (np. songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P)
 */
export function createTextReference(song: TextDoc): string {
  const slug = song.meta.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${song.meta.domain}/${slug}__${song.meta.id}`;
}




