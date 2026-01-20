import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import { TextDoc, TextMeta } from '../../types';
import { TextLoader } from './text-loader';
import { parseTextFile } from './text-parser';

export interface UpdateTextData {
  title?: string;
  description?: string;
  categories?: string[];
  content?: string;
}

function buildTextFile(meta: TextMeta, content: string): string {
  const frontMatter = yaml.dump({
    schemaVersion: meta.schemaVersion,
    id: meta.id,
    title: meta.title,
    description: meta.description,
    categories: meta.categories,
  });

  return `---\n${frontMatter}---\n\n${content}`;
}

export class TextUpdater {
  constructor(private readonly loader: TextLoader) {}

  async updateText(id: string, data: UpdateTextData): Promise<TextDoc | null> {
    const existingText = await this.loader.loadById(id);
    if (!existingText) {
      return null;
    }

    const updatedMeta: TextMeta = {
      ...existingText.meta,
      title: data.title ?? existingText.meta.title,
      description: data.description ?? existingText.meta.description,
      categories: data.categories ?? existingText.meta.categories,
    };

    const updatedContent = data.content ?? existingText.contentRaw;
    const fileContent = buildTextFile(updatedMeta, updatedContent);

    const filePath = await this.findFilePath(id);
    if (!filePath) {
      return null;
    }

    await fs.writeFile(filePath, fileContent, 'utf-8');

    const rawContent = await fs.readFile(filePath, 'utf-8');
    return parseTextFile(rawContent);
  }

  private async findFilePath(id: string): Promise<string | null> {
    const files = await fs.readdir(this.loader['textsDirectory']);
    const targetFile = files.find((file) => file.includes(`__${id}.md`));
    
    if (!targetFile) {
      return null;
    }

    return `${this.loader['textsDirectory']}/${targetFile}`;
  }
}

