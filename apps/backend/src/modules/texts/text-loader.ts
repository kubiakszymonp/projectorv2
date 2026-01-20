import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDoc } from '../../types';
import { parseTextFile } from './text-parser';

// Backend runs from apps/backend, so we need to go up to workspace root
const TEXTS_DIR = path.resolve(process.cwd(), '..', '..', 'data', 'texts');

export class TextLoader {
  private readonly textsDirectory: string;

  constructor(textsDirectory?: string) {
    this.textsDirectory = textsDirectory || TEXTS_DIR;
  }

  /**
   * Get list of available domains (subfolders in texts directory)
   */
  async getDomains(): Promise<string[]> {
    await this.ensureDirectory();

    const entries = await fs.readdir(this.textsDirectory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  }

  /**
   * Load all texts from all domain subfolders
   */
  async loadAll(): Promise<TextDoc[]> {
    await this.ensureDirectory();

    const domains = await this.getDomains();
    const allTexts: TextDoc[] = [];

    for (const domain of domains) {
      const domainPath = path.join(this.textsDirectory, domain);
      const files = await fs.readdir(domainPath);
      const textFiles = files.filter((file) => file.endsWith('.md'));

      const results = await Promise.all(
        textFiles.map((file) => this.loadByFilename(domain, file)),
      );
      const texts = results.filter((t): t is TextDoc => t !== null);
      allTexts.push(...texts);
    }

    return allTexts;
  }

  /**
   * Load text by reference - supports format:
   * - "domain/filename" (e.g. "songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P")
   * 
   * This is consistent with media paths and human-readable.
   * The .md extension is optional.
   * 
   * @param reference - text reference in format "domain/filename"
   */
  async loadByReference(reference: string): Promise<TextDoc | null> {
    // Expected format: domain/filename (e.g. "songs/barka__01HXZ3R8E7Q2V4VJ6T9G2J8N1P")
    if (reference.includes('/')) {
      const slashIndex = reference.indexOf('/');
      const domain = reference.substring(0, slashIndex);
      let filename = reference.substring(slashIndex + 1);
      
      // Add .md extension if not present
      if (!filename.endsWith('.md')) {
        filename = `${filename}.md`;
      }
      
      return this.loadByFilename(domain, filename);
    }

    // Fallback: treat as ID for backward compatibility
    return this.loadById(reference);
  }

  /**
   * Load text by ID - searches across all domains
   */
  async loadById(id: string): Promise<TextDoc | null> {
    await this.ensureDirectory();

    const domains = await this.getDomains();

    for (const domain of domains) {
      const domainPath = path.join(this.textsDirectory, domain);
      const files = await fs.readdir(domainPath);
      const targetFile = files.find((file) => file.includes(`__${id}.md`));

      if (targetFile) {
        return this.loadByFilename(domain, targetFile);
      }
    }

    return null;
  }

  /**
   * Load text file from specific domain
   */
  private async loadByFilename(domain: string, filename: string): Promise<TextDoc | null> {
    const filePath = path.join(this.textsDirectory, domain, filename);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return parseTextFile(content, domain);
    } catch {
      return null;
    }
  }

  /**
   * Delete text by ID - searches across all domains
   */
  async deleteText(id: string): Promise<boolean> {
    await this.ensureDirectory();

    const domains = await this.getDomains();

    for (const domain of domains) {
      const domainPath = path.join(this.textsDirectory, domain);
      const files = await fs.readdir(domainPath);
      const targetFile = files.find((file) => file.includes(`__${id}.md`));

      if (targetFile) {
        const filePath = path.join(domainPath, targetFile);
        await fs.unlink(filePath);
        return true;
      }
    }

    return false;
  }

  /**
   * Find file path by ID - searches across all domains
   * Returns { domain, filePath } or null
   */
  async findFileById(id: string): Promise<{ domain: string; filePath: string } | null> {
    await this.ensureDirectory();

    const domains = await this.getDomains();

    for (const domain of domains) {
      const domainPath = path.join(this.textsDirectory, domain);
      const files = await fs.readdir(domainPath);
      const targetFile = files.find((file) => file.includes(`__${id}.md`));

      if (targetFile) {
        return {
          domain,
          filePath: path.join(domainPath, targetFile),
        };
      }
    }

    return null;
  }

  /**
   * Ensure texts directory exists
   */
  private async ensureDirectory(): Promise<void> {
    try {
      await fs.access(this.textsDirectory);
    } catch {
      await fs.mkdir(this.textsDirectory, { recursive: true });
    }
  }

  /**
   * Ensure domain subfolder exists
   */
  async ensureDomain(domain: string): Promise<void> {
    const domainPath = path.join(this.textsDirectory, domain);
    try {
      await fs.access(domainPath);
    } catch {
      await fs.mkdir(domainPath, { recursive: true });
    }
  }

  /**
   * Get file path for a new text in specific domain
   */
  getFilePath(domain: string, slug: string, id: string): string {
    return path.join(this.textsDirectory, domain, `${slug}__${id}.md`);
  }

  /**
   * Get the texts root directory
   */
  getTextsDirectory(): string {
    return this.textsDirectory;
  }
}

