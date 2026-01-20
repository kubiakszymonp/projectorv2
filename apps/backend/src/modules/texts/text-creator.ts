import { promises as fs } from 'fs';
import { ulid } from 'ulid';
import slugify from 'slugify';
import yaml from 'js-yaml';
import { TextMeta, TextDoc } from '../../types';
import { TextLoader } from './text-loader';

export interface CreateTextData {
  domain: string;
  title: string;
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

export class TextCreator {
  constructor(private readonly loader: TextLoader) {}

  async createText(data: CreateTextData): Promise<TextDoc> {
    const id = ulid();
    const slug = slugify(data.title, {
      lower: true,
      strict: true,
      locale: 'pl',
    });

    // Ensure domain folder exists
    await this.loader.ensureDomain(data.domain);

    const meta: TextMeta = {
      schemaVersion: 1,
      id,
      domain: data.domain,
      title: data.title,
      description: data.description || '',
      categories: data.categories || [],
    };

    const content = data.content || '<wpisz tekst>';
    const fileContent = buildTextFile(meta, content);
    const filePath = this.loader.getFilePath(data.domain, slug, id);

    await fs.writeFile(filePath, fileContent, 'utf-8');

    const text = await this.loader.loadById(id);
    if (!text) {
      throw new Error('Failed to load created text');
    }

    return text;
  }
}

