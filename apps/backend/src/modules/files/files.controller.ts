import {
  Controller,
  Get,
  Post,
  Put,
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
import { FilesService } from './files.service';
import {
  ListFilesDto,
  CreateFolderDto,
  RenameFileDto,
  DeleteFileDto,
  GetFileDto,
  UploadFileDto,
  SaveFileDto,
  FileListResponse,
  FolderTreeResponse,
  FileUploadResponse,
} from '../../types';
import { FileTypeDetector } from './file-type-detector';

@ApiTags('Files Explorer')
@Controller('api/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * GET /api/files?path=<path>
   * Listuje zawartość folderu
   */
  @Get()
  @ApiOperation({ summary: 'Listuje zawartość folderu' })
  @ApiQuery({
    name: 'path',
    required: false,
    description: 'Względna ścieżka do folderu (domyślnie root data/)',
    example: 'media/ogloszenia',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista plików i folderów',
    type: Object, // FileListResponse
  })
  async list(@Query() dto: ListFilesDto): Promise<FileListResponse> {
    return this.filesService.list(dto.path || '');
  }

  /**
   * GET /api/files/tree
   * Zwraca drzewo folderów (do sidebaru)
   */
  @Get('tree')
  @ApiOperation({ summary: 'Zwraca drzewo folderów (rekurencyjnie)' })
  @ApiResponse({
    status: 200,
    description: 'Drzewo folderów',
    type: Object, // FolderTreeResponse
  })
  async getTree(): Promise<FolderTreeResponse> {
    return this.filesService.getTree();
  }

  /**
   * POST /api/files/upload
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
          description: 'Folder docelowy (np. "media/ogloszenia")',
          example: 'media/ogloszenia',
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
    type: Object, // FileUploadResponse
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body('path') relativePath: string = '',
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileUploadResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.filesService.uploadFile(relativePath, file);
  }

  /**
   * POST /api/files/folders
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
    await this.filesService.createFolder(dto.path);
    return { success: true };
  }

  /**
   * POST /api/files/rename
   * Rename pliku lub folderu
   */
  @Post('rename')
  @ApiOperation({ summary: 'Rename pliku lub folderu' })
  @ApiBody({ type: RenameFileDto })
  @ApiResponse({
    status: 200,
    description: 'Plik/folder został przemianowany',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  async rename(@Body() dto: RenameFileDto): Promise<{ success: boolean }> {
    await this.filesService.rename(dto.path, dto.newName);
    return { success: true };
  }

  /**
   * PUT /api/files/save
   * Zapisuje/nadpisuje plik tekstowy
   */
  @Put('save')
  @ApiOperation({ summary: 'Zapisuje zawartość pliku tekstowego' })
  @ApiBody({ type: SaveFileDto })
  @ApiResponse({
    status: 200,
    description: 'Plik został zapisany',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  async saveFile(@Body() dto: SaveFileDto): Promise<{ success: boolean }> {
    await this.filesService.saveFile(dto.path, dto.content);
    return { success: true };
  }

  /**
   * DELETE /api/files?path=<path>
   * Soft delete (przenosi do trash)
   */
  @Delete()
  @ApiOperation({ summary: 'Usuwa plik lub folder (soft delete)' })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Ścieżka do pliku/folderu do usunięcia',
    example: 'media/ogloszenia/plik.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Plik/folder został przeniesiony do trash',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  async delete(@Query() dto: DeleteFileDto): Promise<{ success: boolean }> {
    await this.filesService.delete(dto.path);
    return { success: true };
  }

  /**
   * GET /api/files/check?path=<path>
   * Sprawdza czy ścieżka to folder czy plik
   */
  @Get('check')
  @ApiOperation({ summary: 'Sprawdza czy ścieżka to folder czy plik' })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Ścieżka do sprawdzenia',
    example: 'media/ogloszenia/plik.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Typ ścieżki',
    schema: {
      type: 'object',
      properties: {
        isDir: { type: 'boolean' },
      },
    },
  })
  async checkPath(@Query() dto: GetFileDto): Promise<{ isDir: boolean }> {
    return this.filesService.checkPathType(dto.path);
  }

  /**
   * GET /api/files/file?path=<path>
   * Pobiera plik (binary streaming)
   */
  @Get('file')
  @ApiOperation({ summary: 'Pobiera plik (binary streaming)' })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Ścieżka do pliku',
    example: 'media/ogloszenia/plik.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Plik (binary)',
    content: {
      'image/*': {},
      'video/*': {},
      'audio/*': {},
      'text/*': {},
      'application/octet-stream': {},
    },
  })
  async getFile(
    @Query() dto: GetFileDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filePath = this.filesService.getFilePath(dto.path);

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
    const mimeType = this.getMimeType(fileName);

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
   * Mapuje rozszerzenie na MIME type
   */
  private getMimeType(fileName: string): string {
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

    // Tekst/Dokumenty
    const textMap: Record<string, string> = {
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.yaml': 'text/yaml',
      '.yml': 'text/yaml',
      '.json': 'application/json',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
    };

    return (
      imageMap[ext] ||
      videoMap[ext] ||
      audioMap[ext] ||
      textMap[ext] ||
      'application/octet-stream'
    );
  }
}

