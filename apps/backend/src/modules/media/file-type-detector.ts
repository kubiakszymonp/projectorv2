import * as path from 'path';
import { MediaKind } from '../../types';

/**
 * Wykrywa typ pliku na podstawie MIME i rozszerzenia
 */
export class FileTypeDetector {
  private static readonly EXTENSION_MAP: Record<string, MediaKind> = {
    // Images
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.webp': 'image',
    '.bmp': 'image',
    '.svg': 'image',
    '.ico': 'image',
    '.tiff': 'image',
    '.tif': 'image',

    // Videos
    '.mp4': 'video',
    '.webm': 'video',
    '.mov': 'video',
    '.avi': 'video',
    '.mkv': 'video',
    '.flv': 'video',
    '.wmv': 'video',
    '.m4v': 'video',
    '.mpg': 'video',
    '.mpeg': 'video',

    // Audio
    '.mp3': 'audio',
    '.wav': 'audio',
    '.ogg': 'audio',
    '.m4a': 'audio',
    '.flac': 'audio',
    '.aac': 'audio',
    '.wma': 'audio',
    '.opus': 'audio',

    // Documents
    '.pdf': 'document',
    '.doc': 'document',
    '.docx': 'document',
    '.xls': 'document',
    '.xlsx': 'document',
    '.ppt': 'document',
    '.pptx': 'document',
    '.txt': 'document',
    '.rtf': 'document',
    '.odt': 'document',
    '.ods': 'document',
    '.odp': 'document',
  };

  /**
   * Wykrywa typ na podstawie MIME type (z uploadu) lub rozszerzenia
   */
  static detect(mimeType?: string, fileName?: string): MediaKind {
    // Najpierw spróbuj MIME
    if (mimeType) {
      const kindFromMime = this.detectFromMime(mimeType);
      if (kindFromMime !== 'other') {
        return kindFromMime;
      }
    }

    // Fallback do rozszerzenia
    if (fileName) {
      return this.detectFromExtension(fileName);
    }

    return 'other';
  }

  /**
   * Wykrywa typ z MIME type
   */
  private static detectFromMime(mimeType: string): MediaKind {
    const mime = mimeType.toLowerCase();

    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    if (
      mime.startsWith('application/pdf') ||
      mime.includes('document') ||
      mime.includes('text/')
    ) {
      return 'document';
    }

    return 'other';
  }

  /**
   * Wykrywa typ z rozszerzenia pliku
   */
  static detectFromExtension(fileName: string): MediaKind {
    const ext = path.extname(fileName).toLowerCase();
    return this.EXTENSION_MAP[ext] || 'other';
  }
}

