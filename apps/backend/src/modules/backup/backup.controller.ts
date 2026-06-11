import {
  Controller,
  Get,
  Post,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import { BackupService } from './backup.service';
import { getDataPath } from '../../common/paths';

const backupUploadStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const tmpDir = getDataPath('tmp');
    fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (_req, _file, cb) => {
    cb(null, `backup__${Date.now()}.zip`);
  },
});

@ApiTags('Backup')
@Controller('api/backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * GET /api/backup — pobierz kopię zapasową całego data/ jako ZIP
   */
  @Get()
  @ApiOperation({ summary: 'Pobierz kopię zapasową (ZIP całego data/)' })
  async download(@Res() res: Response): Promise<void> {
    const archive = this.backupService.createArchive();
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${this.backupService.suggestedFilename()}"`,
    });
    archive.pipe(res);
    await archive.finalize();
  }

  /**
   * POST /api/backup/import — przywróć kopię zapasową z przesłanego ZIP
   */
  @Post('import')
  @ApiOperation({ summary: 'Przywróć kopię zapasową z pliku ZIP' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: backupUploadStorage,
      limits: { fileSize: 2 * 1024 * 1024 * 1024 },
    }),
  )
  async import(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      await this.backupService.importArchive(file.path);
      return { success: true };
    } finally {
      fs.promises.unlink(file.path).catch(() => {});
    }
  }
}
