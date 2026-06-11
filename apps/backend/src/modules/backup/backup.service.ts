import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import { getDataDir } from '../../common/paths';

/**
 * Backup/restore of the whole data/ directory (songs, scenarios, settings, media).
 */
@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly dataDir: string;

  constructor() {
    this.dataDir = getDataDir();
  }

  /**
   * Build a ZIP archive stream of data/ (excluding trash and tmp).
   * Caller pipes it to the HTTP response.
   */
  createArchive(): archiver.Archiver {
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('warning', (err) => this.logger.warn(`Archive warning: ${err}`));
    archive.on('error', (err) => this.logger.error('Archive error', err));
    archive.glob('**/*', {
      cwd: this.dataDir,
      ignore: ['trash/**', 'tmp/**'],
      dot: true,
    });
    return archive;
  }

  suggestedFilename(): string {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    return `projector-backup-${stamp}.zip`;
  }

  /**
   * Restore a backup ZIP into data/ (overwrites existing files).
   * Guards against zip-slip path traversal.
   */
  async importArchive(zipPath: string): Promise<void> {
    const zip = new AdmZip(zipPath);

    // Validate every entry stays within dataDir
    for (const entry of zip.getEntries()) {
      const target = path.resolve(this.dataDir, entry.entryName);
      if (target !== this.dataDir && !target.startsWith(this.dataDir + path.sep)) {
        throw new BadRequestException(
          `Unsafe path in archive: ${entry.entryName}`,
        );
      }
    }

    await fs.mkdir(this.dataDir, { recursive: true });
    zip.extractAllTo(this.dataDir, /* overwrite */ true);
    this.logger.log('Backup restored from uploaded archive');
  }
}
