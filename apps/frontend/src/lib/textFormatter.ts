/**
 * Frontend port of the backend TextFormatterService so the editor preview
 * paginates exactly like the real display (maxCharsPerLine / maxLinesPerPage).
 * Keep in sync with apps/backend/src/modules/texts/text-formatter.service.ts.
 */

export interface FormatterSettings {
  maxCharsPerLine: number;
  maxLinesPerPage: number;
}

export function splitIntoLines(text: string, maxChars: number): string[] {
  if (maxChars <= 0) return [text];

  const lines: string[] = [];
  const inputLines = text.split('\n');

  for (const inputLine of inputLines) {
    if (inputLine.trim().length === 0) {
      lines.push('');
      continue;
    }

    const words = inputLine.trim().split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (word.length > maxChars) {
        if (currentLine.length > 0) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        let remaining = word;
        while (remaining.length > 0) {
          if (remaining.length <= maxChars) {
            currentLine = remaining;
            break;
          }
          lines.push(remaining.substring(0, maxChars));
          remaining = remaining.substring(maxChars);
        }
      } else {
        const potential = currentLine.length > 0 ? `${currentLine} ${word}` : word;
        if (potential.length <= maxChars) {
          currentLine = potential;
        } else {
          if (currentLine.length > 0) lines.push(currentLine.trim());
          currentLine = word;
        }
      }
    }

    if (currentLine.length > 0) lines.push(currentLine.trim());
  }

  return lines.length > 0 ? lines : [''];
}

export function splitLinesIntoPages(lines: string[], maxLines: number): string[] {
  if (maxLines <= 0) return [lines.join('\n')];
  if (lines.length === 0) return [''];

  const pages: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    current.push(line);
    if (current.length >= maxLines) {
      pages.push(current.join('\n'));
      current = [];
    }
  }
  if (current.length > 0) pages.push(current.join('\n'));
  return pages.length > 0 ? pages : [''];
}

/**
 * Format one slide's content into pages.
 */
export function formatTextToPages(slideContent: string, settings: FormatterSettings): string[] {
  if (!slideContent || slideContent.trim().length === 0) return [''];
  const lines = splitIntoLines(slideContent, settings.maxCharsPerLine);
  return splitLinesIntoPages(lines, settings.maxLinesPerPage);
}
