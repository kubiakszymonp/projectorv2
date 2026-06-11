import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TextsService } from './modules/texts/texts.service';

export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
  texts: number;
  diskFreeBytes: number | null;
  diskTotalBytes: number | null;
  timestamp: string;
}

@Injectable()
export class AppService {
  constructor(private readonly textsService: TextsService) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Lightweight health/status endpoint for healthchecks and the Settings panel.
   */
  async getHealth(): Promise<HealthStatus> {
    const texts = await this.textsService.findAll();
    const disk = await this.getDiskInfo();
    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      texts: texts.length,
      diskFreeBytes: disk.free,
      diskTotalBytes: disk.total,
      timestamp: new Date().toISOString(),
    };
  }

  private async getDiskInfo(): Promise<{ free: number | null; total: number | null }> {
    try {
      const dataDir = path.resolve(process.cwd(), '..', '..', 'data');
      // fs.statfs available since Node 18.15
      const stat = await (fs as unknown as {
        statfs: (p: string) => Promise<{ bsize: number; blocks: number; bavail: number }>;
      }).statfs(dataDir);
      return {
        free: stat.bavail * stat.bsize,
        total: stat.blocks * stat.bsize,
      };
    } catch {
      return { free: null, total: null };
    }
  }
}
