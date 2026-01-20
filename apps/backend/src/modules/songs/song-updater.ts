import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import { SongDoc, SongMeta } from '../../types';
import { SongLoader } from './song-loader';
import { parseSongFile } from './song-parser';

export interface UpdateSongData {
  title?: string;
  description?: string;
  categories?: string[];
  content?: string;
}

function buildSongFile(meta: SongMeta, content: string): string {
  const frontMatter = yaml.dump({
    schemaVersion: meta.schemaVersion,
    id: meta.id,
    title: meta.title,
    description: meta.description,
    categories: meta.categories,
  });

  return `---\n${frontMatter}---\n\n${content}`;
}

export class SongUpdater {
  constructor(private readonly loader: SongLoader) {}

  async updateSong(id: string, data: UpdateSongData): Promise<SongDoc | null> {
    const existingSong = await this.loader.loadById(id);
    if (!existingSong) {
      return null;
    }

    const updatedMeta: SongMeta = {
      ...existingSong.meta,
      title: data.title ?? existingSong.meta.title,
      description: data.description ?? existingSong.meta.description,
      categories: data.categories ?? existingSong.meta.categories,
    };

    const updatedContent = data.content ?? existingSong.contentRaw;
    const fileContent = buildSongFile(updatedMeta, updatedContent);

    const filePath = await this.findFilePath(id);
    if (!filePath) {
      return null;
    }

    await fs.writeFile(filePath, fileContent, 'utf-8');

    const rawContent = await fs.readFile(filePath, 'utf-8');
    return parseSongFile(rawContent);
  }

  private async findFilePath(id: string): Promise<string | null> {
    const files = await fs.readdir(this.loader['songsDirectory']);
    const targetFile = files.find((file) => file.includes(`__${id}.md`));
    
    if (!targetFile) {
      return null;
    }

    return `${this.loader['songsDirectory']}/${targetFile}`;
  }
}

