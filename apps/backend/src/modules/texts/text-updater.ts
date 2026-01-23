import { promises as fs } from 'fs';
import * as path from 'path';
import slugify from 'slugify';
import yaml from 'js-yaml';
import { TextDoc, TextMeta } from '../../types';
import { TextLoader } from './text-loader';
import { parseTextFile } from './text-parser';

export interface UpdateTextData {
  domain?: string;
  title?: string;
  description?: string;
  categories?: string[];
  content?: string;
}

function buildTextFile(meta: TextMeta, content: string): string {
  // Note: domain is not stored in frontmatter - it's derived from folder structure
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

    const fileInfo = await this.loader.findFileById(id);
    if (!fileInfo) {
      return null;
    }

    const newDomain = data.domain ?? existingText.meta.domain;
    const newTitle = data.title ?? existingText.meta.title;

    const updatedMeta: TextMeta = {
      ...existingText.meta,
      domain: newDomain,
      title: newTitle,
      description: data.description ?? existingText.meta.description,
      categories: data.categories ?? existingText.meta.categories,
    };

    const updatedContent = data.content ?? existingText.contentRaw;
    const fileContent = buildTextFile(updatedMeta, updatedContent);

    // Check if domain changed - need to move file
    const domainChanged = newDomain !== fileInfo.domain;

    if (domainChanged) {
      // Ensure new domain folder exists
      await this.loader.ensureDomain(newDomain);

      // Generate new file path in new domain
      const slug = slugify(newTitle, {
        lower: true,
        strict: true,
        locale: 'pl',
      });
      const newFilePath = this.loader.getFilePath(newDomain, slug, id);

      // Write to new location
      await fs.writeFile(newFilePath, fileContent, 'utf-8');

      // Delete old file
      await fs.unlink(fileInfo.filePath);

      const rawContent = await fs.readFile(newFilePath, 'utf-8');
      // Generate relative path from data/ folder: texts/domain/filename
      const filename = path.basename(newFilePath);
      const relativePath = `texts/${newDomain}/${filename}`;
      return parseTextFile(rawContent, newDomain, relativePath);
    } else {
      // Same domain - update in place
      await fs.writeFile(fileInfo.filePath, fileContent, 'utf-8');

      const rawContent = await fs.readFile(fileInfo.filePath, 'utf-8');
      // Generate relative path from data/ folder: texts/domain/filename
      const filename = path.basename(fileInfo.filePath);
      const relativePath = `texts/${newDomain}/${filename}`;
      return parseTextFile(rawContent, newDomain, relativePath);
    }
  }
}

