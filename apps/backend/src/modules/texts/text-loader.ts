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

  async loadAll(): Promise<TextDoc[]> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.textsDirectory);
    const textFiles = files.filter((file) => file.endsWith('.md'));

    const texts = await Promise.all(
      textFiles.map((file) => this.loadByFilename(file)),
    );

    return texts;
  }

  async loadById(id: string): Promise<TextDoc | null> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.textsDirectory);
    const targetFile = files.find((file) => file.includes(`__${id}.md`));

    if (!targetFile) {
      return null;
    }

    return this.loadByFilename(targetFile);
  }

  private async loadByFilename(filename: string): Promise<TextDoc> {
    const filePath = path.join(this.textsDirectory, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return parseTextFile(content);
  }

  async deleteText(id: string): Promise<boolean> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.textsDirectory);
    const targetFile = files.find((file) => file.includes(`__${id}.md`));

    if (!targetFile) {
      return false;
    }

    const filePath = path.join(this.textsDirectory, targetFile);
    await fs.unlink(filePath);
    return true;
  }

  private async ensureDirectory(): Promise<void> {
    try {
      await fs.access(this.textsDirectory);
    } catch {
      await fs.mkdir(this.textsDirectory, { recursive: true });
    }
  }

  getFilePath(slug: string, id: string): string {
    return path.join(this.textsDirectory, `${slug}__${id}.md`);
  }
}

