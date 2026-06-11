/**
 * Helpers for recognising song sections (refrain / verse / bridge) and for
 * repeating the refrain between verses (responsorial psalms, typical hymns).
 */

export type SlideSection =
  | { kind: 'refrain'; label: string }
  | { kind: 'verse'; label: string }
  | { kind: 'bridge'; label: string }
  | { kind: 'slide'; label: string };

const REFRAIN_RE = /^\s*(?:\[\s*(?:ref|refren)\s*\]|ref(?:ren)?\s*[:.])/i;
const BRIDGE_RE = /^\s*\[\s*bridge\s*\]/i;
const VERSE_RE = /^\s*\[\s*(\d+)\s*\]/;

export function isRefrainSlide(slide: string): boolean {
  return REFRAIN_RE.test(slide);
}

/**
 * Classify a slide and produce a human label for the slide list.
 * Verses are numbered sequentially when not explicitly marked.
 */
export function getSlideSection(slide: string, verseNumber: number): SlideSection {
  if (REFRAIN_RE.test(slide)) return { kind: 'refrain', label: 'Refren' };
  if (BRIDGE_RE.test(slide)) return { kind: 'bridge', label: 'Bridge' };
  const m = slide.match(VERSE_RE);
  if (m) return { kind: 'verse', label: `Zwrotka ${m[1]}` };
  return { kind: 'verse', label: `Zwrotka ${verseNumber}` };
}

/**
 * Build slide labels for a list of slides, numbering only the verses.
 */
export function buildSlideLabels(slides: string[]): SlideSection[] {
  let verse = 0;
  return slides.map((slide) => {
    if (REFRAIN_RE.test(slide) || BRIDGE_RE.test(slide)) {
      return getSlideSection(slide, verse);
    }
    verse += 1;
    return getSlideSection(slide, verse);
  });
}

/**
 * Insert the (first) refrain after every verse. Idempotent-ish: existing
 * refrain slides between verses are removed first, then re-inserted, so
 * pressing twice doesn't multiply refrains.
 */
export function duplicateRefrainBetweenVerses(content: string): string {
  const slides = content
    .split(/\n\s*\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const refrain = slides.find((s) => isRefrainSlide(s));
  if (!refrain) return content; // brak refrenu — nic nie rób

  const verses = slides.filter((s) => !isRefrainSlide(s));
  if (verses.length === 0) return content;

  const result: string[] = [];
  // Refren na początku (typowy psalm responsoryjny), potem po każdej zwrotce
  result.push(refrain);
  for (const verse of verses) {
    result.push(verse);
    result.push(refrain);
  }

  return result.join('\n\n');
}
