import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SongDoc } from '../../types';
import { SongLoader } from './song-loader';
import { SongCreator, CreateSongData } from './song-creator';
import { SongUpdater, UpdateSongData } from './song-updater';

@Injectable()
export class SongsService implements OnModuleInit {
  private readonly logger = new Logger(SongsService.name);
  private readonly songsMap: Map<string, SongDoc> = new Map();
  private readonly loader: SongLoader;
  private readonly creator: SongCreator;
  private readonly updater: SongUpdater;

  constructor() {
    this.loader = new SongLoader();
    this.creator = new SongCreator(this.loader);
    this.updater = new SongUpdater(this.loader);
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Loading songs into memory...');
    try {
      const songs = await this.loader.loadAll();
      for (const song of songs) {
        this.songsMap.set(song.meta.id, song);
      }
      this.logger.log(`Loaded ${this.songsMap.size} songs into memory`);
    } catch (error) {
      this.logger.error('Failed to load songs', error);
    }
  }

  async findAll(): Promise<SongDoc[]> {
    return Array.from(this.songsMap.values());
  }

  async findById(id: string): Promise<SongDoc | null> {
    return this.songsMap.get(id) || null;
  }

  async create(data: CreateSongData): Promise<SongDoc> {
    const song = await this.creator.createSong(data);
    this.songsMap.set(song.meta.id, song);
    this.logger.log(`Created song: ${song.meta.title} (${song.meta.id})`);
    return song;
  }

  async update(id: string, data: UpdateSongData): Promise<SongDoc | null> {
    const song = await this.updater.updateSong(id, data);
    if (song) {
      this.songsMap.set(id, song);
      this.logger.log(`Updated song: ${song.meta.title} (${id})`);
    }
    return song;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.loader.deleteSong(id);
    if (deleted) {
      this.songsMap.delete(id);
      this.logger.log(`Deleted song: ${id}`);
    }
    return deleted;
  }

  async reloadFromDisk(): Promise<{ count: number }> {
    this.logger.log('Reloading songs from disk...');
    this.songsMap.clear();
    
    try {
      const songs = await this.loader.loadAll();
      for (const song of songs) {
        this.songsMap.set(song.meta.id, song);
      }
      const count = this.songsMap.size;
      this.logger.log(`Reloaded ${count} songs into memory`);
      return { count };
    } catch (error) {
      this.logger.error('Failed to reload songs', error);
      throw error;
    }
  }
}

