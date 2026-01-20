// ========== MEDIA DOMAIN - DTOs ==========

import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * Query params dla listowania folderu
 * GET /api/media?path=<path>
 */
export class ListMediaDto {
  @IsOptional()
  @IsString()
  path?: string;
}

/**
 * Body dla tworzenia folderu
 * POST /api/media/folders
 */
export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  path: string;
}

/**
 * Body dla rename
 * POST /api/media/rename
 */
export class RenameMediaDto {
  @IsNotEmpty()
  @IsString()
  path: string;

  @IsNotEmpty()
  @IsString()
  newName: string;
}

/**
 * Query params dla delete
 * DELETE /api/media?path=<path>
 */
export class DeleteMediaDto {
  @IsNotEmpty()
  @IsString()
  path: string;
}

/**
 * Query params dla pobierania pliku
 * GET /api/media/file?path=<path>
 */
export class GetFileDto {
  @IsNotEmpty()
  @IsString()
  path: string;
}

/**
 * Body fields dla uploadu (multipart/form-data)
 * POST /api/media/upload
 */
export class UploadMediaDto {
  @IsOptional()
  @IsString()
  path?: string;
  // file: Express.Multer.File - dodawane przez multer
}
