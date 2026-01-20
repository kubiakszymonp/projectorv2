// ========== FILES DOMAIN - DTOs ==========

import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * Query params dla listowania folderu
 * GET /api/files?path=<path>
 */
export class ListFilesDto {
  @IsOptional()
  @IsString()
  path?: string;
}

/**
 * Body dla tworzenia folderu
 * POST /api/files/folders
 */
export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  path: string;
}

/**
 * Body dla rename
 * POST /api/files/rename
 */
export class RenameFileDto {
  @IsNotEmpty()
  @IsString()
  path: string;

  @IsNotEmpty()
  @IsString()
  newName: string;
}

/**
 * Query params dla delete
 * DELETE /api/files?path=<path>
 */
export class DeleteFileDto {
  @IsNotEmpty()
  @IsString()
  path: string;
}

/**
 * Query params dla pobierania pliku
 * GET /api/files/file?path=<path>
 */
export class GetFileDto {
  @IsNotEmpty()
  @IsString()
  path: string;
}

/**
 * Body fields dla uploadu (multipart/form-data)
 * POST /api/files/upload
 */
export class UploadFileDto {
  @IsOptional()
  @IsString()
  path?: string;
  // file: Express.Multer.File - dodawane przez multer
}

