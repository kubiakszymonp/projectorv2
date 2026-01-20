import { promises as fs } from 'fs';
import * as path from 'path';
import { SongDoc } from '../../types';
import { parseSongFile } from './song-parser';

// Backend runs from apps/backend, so we need to go up to workspace root
const SONGS_DIR = path.resolve(process.cwd(), '..', '..', 'data', 'songs');

export class SongLoader {
  private readonly songsDirectory: string;

  constructor(songsDirectory?: string) {
    this.songsDirectory = songsDirectory || SONGS_DIR;
  }

  async loadAll(): Promise<SongDoc[]> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.songsDirectory);
    const songFiles = files.filter((file) => file.endsWith('.md'));

    const songs = await Promise.all(
      songFiles.map((file) => this.loadByFilename(file)),
    );

    return songs;
  }

  async loadById(id: string): Promise<SongDoc | null> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.songsDirectory);
    const targetFile = files.find((file) => file.includes(`__${id}.md`));

    if (!targetFile) {
      return null;
    }

    return this.loadByFilename(targetFile);
  }

  private async loadByFilename(filename: string): Promise<SongDoc> {
    const filePath = path.join(this.songsDirectory, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return parseSongFile(content);
  }

  async deleteSong(id: string): Promise<boolean> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.songsDirectory);
    const targetFile = files.find((file) => file.includes(`__${id}.md`));

    if (!targetFile) {
      return false;
    }

    const filePath = path.join(this.songsDirectory, targetFile);
    await fs.unlink(filePath);
    return true;
  }

  private async ensureDirectory(): Promise<void> {
    try {
      await fs.access(this.songsDirectory);
    } catch {
      await fs.mkdir(this.songsDirectory, { recursive: true });
    }
  }

  getFilePath(slug: string, id: string): string {
    return path.join(this.songsDirectory, `${slug}__${id}.md`);
  }
}

