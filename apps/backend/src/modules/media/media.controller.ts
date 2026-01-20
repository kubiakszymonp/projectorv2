import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { MediaService } from './media.service';
import {
  ListMediaDto,
  CreateFolderDto,
  RenameMediaDto,
  DeleteMediaDto,
  GetFileDto,
  UploadMediaDto,
  MediaListResponse,
  MediaTreeResponse,
  MediaUploadResponse,
} from '../../types';
import { FileTypeDetector } from './file-type-detector';

@ApiTags('Media Drive')
@Controller('api/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * GET /api/media?path=<path>
   * Listuje zawartość folderu
   */
  @Get()
  @ApiOperation({ summary: 'Listuje zawartość folderu' })
  @ApiQuery({
    name: 'path',
    required: false,
    description: 'Względna ścieżka do folderu (domyślnie root)',
    example: 'ogloszenia',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista plików i folderów',
    type: Object, // MediaListResponse
  })
  async list(@Query() dto: ListMediaDto): Promise<MediaListResponse> {
    return this.mediaService.list(dto.path || '');
  }

  /**
   * GET /api/media/tree
   * Zwraca drzewo folderów (do sidebaru)
   */
  @Get('tree')
  @ApiOperation({ summary: 'Zwraca drzewo folderów (rekurencyjnie)' })
  @ApiResponse({
    status: 200,
    description: 'Drzewo folderów',
    type: Object, // MediaTreeResponse
  })
  async getTree(): Promise<MediaTreeResponse> {
    return this.mediaService.getTree();
  }

  /**
   * POST /api/media/upload
   * Upload pliku (multipart/form-data)
   * Body: { path: string, file: File }
   */
  @Post('upload')
  @ApiOperation({ summary: 'Upload pliku do folderu' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Plik do uploadu i opcjonalna ścieżka docelowa',
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Folder docelowy (np. "ogloszenia")',
          example: 'ogloszenia',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Plik do uploadu',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Plik został uploadowany',
    type: Object, // MediaUploadResponse
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body('path') relativePath: string = '',
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaUploadResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.mediaService.uploadFile(relativePath, file);
  }

  /**
   * POST /api/media/folders
   * Tworzy nowy folder
   */
  @Post('folders')
  @ApiOperation({ summary: 'Tworzy nowy folder' })
  @ApiBody({ type: CreateFolderDto })
  @ApiResponse({
    status: 201,
    description: 'Folder został utworzony',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  async createFolder(@Body() dto: CreateFolderDto): Promise<{ success: boolean }> {
    await this.mediaService.createFolder(dto.path);
    return { success: true };
  }

  /**
   * POST /api/media/rename
   * Rename pliku lub folderu
   */
  @Post('rename')
  @ApiOperation({ summary: 'Rename pliku lub folderu' })
  @ApiBody({ type: RenameMediaDto })
  @ApiResponse({
    status: 200,
    description: 'Plik/folder został przemianowany',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  async rename(@Body() dto: RenameMediaDto): Promise<{ success: boolean }> {
    await this.mediaService.rename(dto.path, dto.newName);
    return { success: true };
  }

  /**
   * DELETE /api/media?path=<path>
   * Soft delete (przenosi do trash)
   */
  @Delete()
  @ApiOperation({ summary: 'Usuwa plik lub folder (soft delete)' })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Ścieżka do pliku/folderu do usunięcia',
    example: 'ogloszenia/plik.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Plik/folder został przeniesiony do trash',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  async delete(@Query() dto: DeleteMediaDto): Promise<{ success: boolean }> {
    await this.mediaService.delete(dto.path);
    return { success: true };
  }

  /**
   * GET /api/media/file?path=<path>
   * Pobiera plik (binary streaming)
   */
  @Get('file')
  @ApiOperation({ summary: 'Pobiera plik (binary streaming)' })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Ścieżka do pliku',
    example: 'ogloszenia/plik.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Plik (binary)',
    content: {
      'image/*': {},
      'video/*': {},
      'audio/*': {},
      'application/octet-stream': {},
    },
  })
  async getFile(
    @Query() dto: GetFileDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filePath = this.mediaService.getFilePath(dto.path);

    // Sprawdź czy plik istnieje
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      throw new BadRequestException('Path is not a file');
    }

    // Ustaw Content-Type
    const fileName = path.basename(filePath);
    const kind = FileTypeDetector.detectFromExtension(fileName);
    const mimeType = this.getMimeType(kind, fileName);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Length': stat.size,
    });

    // Streaming pliku
    const fileStream = fs.createReadStream(filePath);
    return new StreamableFile(fileStream);
  }

  /**
   * Mapuje MediaKind na MIME type
   */
  private getMimeType(kind: string, fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();

    // Obrazy
    const imageMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
    };

    // Wideo
    const videoMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
    };

    // Audio
    const audioMap: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
    };

    return (
      imageMap[ext] ||
      videoMap[ext] ||
      audioMap[ext] ||
      'application/octet-stream'
    );
  }
}
