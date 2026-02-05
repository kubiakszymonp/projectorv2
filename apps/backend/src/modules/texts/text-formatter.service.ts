import { Injectable } from '@nestjs/common';
import { DisplaySettings } from '../../types/settings';

/**
 * Service for formatting text into pages according to display settings.
 * Implements prompter-style text formatting with configurable line and page limits.
 */
@Injectable()
export class TextFormatterService {
  /**
   * Format slide content into pages based on display settings.
   * Each page respects maxCharsPerLine and maxLinesPerPage constraints.
   *
   * @param slideContent - Raw slide content (may contain newlines)
   * @param settings - Display settings with formatting constraints
   * @returns Array of formatted page contents (each page is a string with newlines)
   */
  formatTextToPages(slideContent: string, settings: DisplaySettings): string[] {
    if (!slideContent || slideContent.trim().length === 0) {
      return [''];
    }

    // First, split into lines respecting maxCharsPerLine
    const lines = this.splitIntoLines(slideContent, settings.maxCharsPerLine);

    // Then, split lines into pages respecting maxLinesPerPage
    const pages = this.splitLinesIntoPages(lines, settings.maxLinesPerPage);

    return pages;
  }

  /**
   * Split text into lines, respecting maxCharsPerLine.
   * Preserves existing newlines and wraps long lines at word boundaries.
   * If a word is longer than maxCharsPerLine, it will be broken.
   *
   * @param text - Text to split (may contain newlines)
   * @param maxChars - Maximum characters per line
   * @returns Array of lines
   */
  splitIntoLines(text: string, maxChars: number): string[] {
    if (maxChars <= 0) {
      return [text];
    }

    const lines: string[] = [];
    const inputLines = text.split('\n');

    for (const inputLine of inputLines) {
      if (inputLine.trim().length === 0) {
        // Preserve empty lines
        lines.push('');
        continue;
      }

      // Split line into words
      const words = inputLine.trim().split(/\s+/);
      let currentLine = '';

      for (const word of words) {
        const wordLength = word.length;

        // If word itself is longer than maxChars, we need to break it
        if (wordLength > maxChars) {
          // First, add current line if it has content
          if (currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = '';
          }

          // Break the long word into chunks
          let remainingWord = word;
          while (remainingWord.length > 0) {
            if (remainingWord.length <= maxChars) {
              currentLine = remainingWord;
              break;
            } else {
              lines.push(remainingWord.substring(0, maxChars));
              remainingWord = remainingWord.substring(maxChars);
            }
          }
        } else {
          // Check if adding this word would exceed maxChars
          const potentialLine = currentLine.length > 0
            ? `${currentLine} ${word}`
            : word;

          if (potentialLine.length <= maxChars) {
            currentLine = potentialLine;
          } else {
            // Current line is full, start a new one
            if (currentLine.length > 0) {
              lines.push(currentLine.trim());
            }
            currentLine = word;
          }
        }
      }

      // Add the last line if it has content
      if (currentLine.length > 0) {
        lines.push(currentLine.trim());
      }
    }

    return lines.length > 0 ? lines : [''];
  }

  /**
   * Split lines into pages, respecting maxLinesPerPage.
   *
   * @param lines - Array of lines to split
   * @param maxLines - Maximum lines per page
   * @returns Array of pages (each page is an array of lines joined with newlines)
   */
  splitLinesIntoPages(lines: string[], maxLines: number): string[] {
    if (maxLines <= 0) {
      return [lines.join('\n')];
    }

    if (lines.length === 0) {
      return [''];
    }

    const pages: string[] = [];
    let currentPageLines: string[] = [];

    for (const line of lines) {
      currentPageLines.push(line);

      if (currentPageLines.length >= maxLines) {
        pages.push(currentPageLines.join('\n'));
        currentPageLines = [];
      }
    }

    // Add remaining lines as the last page
    if (currentPageLines.length > 0) {
      pages.push(currentPageLines.join('\n'));
    }

    return pages.length > 0 ? pages : [''];
  }
}

