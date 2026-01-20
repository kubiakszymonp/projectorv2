import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { TextDoc } from '../../types';
import { TextLoader } from './text-loader';
import { TextCreator, CreateTextData } from './text-creator';
import { TextUpdater, UpdateTextData } from './text-updater';

@Injectable()
export class TextsService implements OnModuleInit {
  private readonly logger = new Logger(TextsService.name);
  private readonly textsMap: Map<string, TextDoc> = new Map();
  private readonly loader: TextLoader;
  private readonly creator: TextCreator;
  private readonly updater: TextUpdater;

  constructor() {
    this.loader = new TextLoader();
    this.creator = new TextCreator(this.loader);
    this.updater = new TextUpdater(this.loader);
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Loading texts into memory...');
    try {
      const texts = await this.loader.loadAll();
      for (const text of texts) {
        this.textsMap.set(text.meta.id, text);
      }
      this.logger.log(`Loaded ${this.textsMap.size} texts into memory`);
    } catch (error) {
      this.logger.error('Failed to load texts', error);
    }
  }

  /**
   * Get list of available domains (subfolders)
   */
  async getDomains(): Promise<string[]> {
    return this.loader.getDomains();
  }

  /**
   * Create a new domain (folder)
   */
  async createDomain(name: string): Promise<void> {
    await this.loader.ensureDomain(name);
    this.logger.log(`Created domain: ${name}`);
  }

  async findAll(): Promise<TextDoc[]> {
    return Array.from(this.textsMap.values());
  }

  async findById(id: string): Promise<TextDoc | null> {
    return this.textsMap.get(id) || null;
  }

  async create(data: CreateTextData): Promise<TextDoc> {
    const text = await this.creator.createText(data);
    this.textsMap.set(text.meta.id, text);
    this.logger.log(`Created text: ${text.meta.title} in domain ${text.meta.domain} (${text.meta.id})`);
    return text;
  }

  async update(id: string, data: UpdateTextData): Promise<TextDoc | null> {
    const text = await this.updater.updateText(id, data);
    if (text) {
      this.textsMap.set(id, text);
      this.logger.log(`Updated text: ${text.meta.title} in domain ${text.meta.domain} (${id})`);
    }
    return text;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.loader.deleteText(id);
    if (deleted) {
      this.textsMap.delete(id);
      this.logger.log(`Deleted text: ${id}`);
    }
    return deleted;
  }

  async reloadFromDisk(): Promise<{ count: number }> {
    this.logger.log('Reloading texts from disk...');
    this.textsMap.clear();
    
    try {
      const texts = await this.loader.loadAll();
      for (const text of texts) {
        this.textsMap.set(text.meta.id, text);
      }
      const count = this.textsMap.size;
      this.logger.log(`Reloaded ${count} texts into memory`);
      return { count };
    } catch (error) {
      this.logger.error('Failed to reload texts', error);
      throw error;
    }
  }
}

