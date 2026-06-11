import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ulid } from 'ulid';
import {
  FileNode,
  FileListResponse,
  FolderTreeResponse,
  FolderTreeNode,
  FileUploadResponse,
} from '../../types';
import { PathValidator } from './path-validator';
import { FileTypeDetector } from './file-type-detector';
import { getDataDir } from '../../common/paths';

export interface TrashEntry {
  /** Nazwa pliku w koszu (identyfikator do restore/delete) */
  name: string;
  /** Oryginalna ścieżka względna (do przywrócenia) */
  originalPath: string;
  /** Wyświetlana nazwa pliku */
  displayName: string;
  deletedAt: string;
  size: number;
}

// Pliki w koszu starsze niż tyle dni są automatycznie usuwane
const TRASH_RETENTION_DAYS = 30;

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly logger = new Logger(FilesService.name);
  private readonly pathValidator: PathValidator;
  private readonly trashRoot: string;

  constructor() {
    // Root dla całego folderu data/ - nie tylko media
    const dataRoot = getDataDir();
    this.pathValidator = new PathValidator(dataRoot);
    this.trashRoot = path.resolve(dataRoot, 'trash');
  }

  async onModuleInit(): Promise<void> {
    // Sprzątanie kosza przy starcie i raz na dobę
    await this.cleanupOldTrash();
    setInterval(() => {
      void this.cleanupOldTrash();
    }, 24 * 60 * 60 * 1000).unref();
  }

  /**
   * Listuje zawartość folderu
   */
  async list(relativePath: string = ''): Promise<FileListResponse> {
    const fullPath = this.pathValidator.safeJoin(relativePath);

    // Sprawdź czy ścieżka istnieje
    try {
      const stat = await fs.stat(fullPath);
      if (!stat.isDirectory()) {
        throw new NotFoundException('Path is not a directory');
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new NotFoundException('Directory not found');
      }
      throw err;
    }

    // Wczytaj zawartość
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const items: FileNode[] = [];

    for (const entry of entries) {
      // Pomijamy folder trash
      if (relativePath === '' && entry.name === 'trash') {
        continue;
      }

      const entryPath = path.join(fullPath, entry.name);
      const relPath = this.pathValidator.getRelativePath(entryPath);
      
      if (entry.isDirectory()) {
        items.push({
          path: relPath,
          name: entry.name,
          isDir: true,
        });
      } else if (entry.isFile()) {
        const stat = await fs.stat(entryPath);
        const kind = FileTypeDetector.detectFromExtension(entry.name);
        
        items.push({
          path: relPath,
          name: entry.name,
          isDir: false,
          kind,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        });
      }
    }

    return {
      path: relativePath,
      items,
    };
  }

  /**
   * Zwraca drzewo folderów (rekurencyjnie)
   */
  async getTree(): Promise<FolderTreeResponse> {
    const root = this.pathValidator.getRoot();
    const folders = await this.scanFoldersRecursive(root, '');

    return {
      path: '',
      folders,
    };
  }

  private async scanFoldersRecursive(
    currentPath: string,
    relativePath: string,
  ): Promise<FolderTreeNode[]> {
    const folders: FolderTreeNode[] = [];

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Pomijamy folder trash
          if (relativePath === '' && entry.name === 'trash') {
            continue;
          }

          const folderPath = path.join(currentPath, entry.name);
          const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

          folders.push({
            path: relPath,
            name: entry.name,
          });

          // Rekurencyjnie skanuj podfoldery
          const subFolders = await this.scanFoldersRecursive(folderPath, relPath);
          folders.push(...subFolders);
        }
      }
    } catch (err) {
      // Ignoruj błędy uprawnień
    }

    return folders;
  }

  /**
   * Tworzy nowy folder
   */
  async createFolder(relativePath: string): Promise<void> {
    const fullPath = this.pathValidator.safeJoin(relativePath);

    // Sprawdź czy już istnieje
    try {
      await fs.access(fullPath);
      throw new ConflictException('Folder already exists');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    // Utwórz folder (recursive dla parent folders)
    await fs.mkdir(fullPath, { recursive: true });
  }

  /**
   * Upload pliku
   */
  async uploadFile(
    relativePath: string,
    file: Express.Multer.File,
  ): Promise<FileUploadResponse> {
    const folderPath = this.pathValidator.safeJoin(relativePath);

    // Upewnij się że folder istnieje
    await fs.mkdir(folderPath, { recursive: true });

    // Przygotuj nazwę pliku
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sluggedName = this.slugify(baseName);
    
    // Sprawdź konflikty i dodaj ULID jeśli potrzeba
    let finalName = `${sluggedName}${ext}`;
    let finalPath = path.join(folderPath, finalName);
    
    try {
      await fs.access(finalPath);
      // Konflikt - dodaj ULID
      finalName = `${sluggedName}__${ulid()}${ext}`;
      finalPath = path.join(folderPath, finalName);
    } catch {
      // OK, nie ma konfliktu
    }

    // Przenieś plik z temp (diskStorage) do docelowej lokalizacji.
    // Temp leży w tym samym wolumenie data/, więc rename jest atomiczny.
    try {
      await fs.rename(file.path, finalPath);
    } catch (err) {
      // Fallback gdy temp i cel są na różnych systemach plików
      if ((err as NodeJS.ErrnoException).code === 'EXDEV') {
        await fs.copyFile(file.path, finalPath);
        await fs.unlink(file.path).catch(() => {});
      } else {
        await fs.unlink(file.path).catch(() => {});
        throw err;
      }
    }

    // Wykryj typ
    const kind = FileTypeDetector.detect(file.mimetype, finalName);
    const stat = await fs.stat(finalPath);
    const relPath = this.pathValidator.getRelativePath(finalPath);

    return {
      node: {
        path: relPath,
        name: finalName,
        isDir: false,
        kind,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      },
    };
  }

  /**
   * Rename pliku lub folderu
   */
  async rename(relativePath: string, newName: string): Promise<void> {
    this.pathValidator.validateName(newName);
    
    const oldPath = this.pathValidator.safeJoin(relativePath);
    const parentDir = path.dirname(oldPath);
    const newPath = path.join(parentDir, newName);

    // Sprawdź czy stary plik istnieje
    try {
      await fs.access(oldPath);
    } catch {
      throw new NotFoundException('File or folder not found');
    }

    // Sprawdź czy nowa nazwa już istnieje
    try {
      await fs.access(newPath);
      throw new ConflictException('Target name already exists');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    await fs.rename(oldPath, newPath);
  }

  /**
   * Soft delete - przenosi do trash
   */
  async delete(relativePath: string): Promise<void> {
    const fullPath = this.pathValidator.safeJoin(relativePath);

    // Sprawdź czy istnieje
    try {
      await fs.access(fullPath);
    } catch {
      throw new NotFoundException('File or folder not found');
    }

    // Zakoduj oryginalną ścieżkę w nazwie, by można było przywrócić plik.
    // Format: <timestamp>__<encodeURIComponent(relPath)>
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const relPath = this.pathValidator.getRelativePath(fullPath).replace(/\\/g, '/');
    const trashName = `${timestamp}__${encodeURIComponent(relPath)}`;
    const trashPath = path.join(this.trashRoot, trashName);

    // Upewnij się że trash folder istnieje
    await fs.mkdir(this.trashRoot, { recursive: true });

    // Przenieś do trash
    await fs.rename(fullPath, trashPath);
  }

  /**
   * Listuje zawartość kosza (najnowsze pierwsze)
   */
  async listTrash(): Promise<TrashEntry[]> {
    let entries: string[];
    try {
      entries = await fs.readdir(this.trashRoot);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }

    const result: TrashEntry[] = [];
    for (const name of entries) {
      const parsed = this.parseTrashName(name);
      if (!parsed) continue;
      let size = 0;
      try {
        size = (await fs.stat(path.join(this.trashRoot, name))).size;
      } catch {
        continue;
      }
      result.push({
        name,
        originalPath: parsed.originalPath,
        displayName: path.basename(parsed.originalPath),
        deletedAt: parsed.deletedAt,
        size,
      });
    }

    return result.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  }

  /**
   * Przywraca plik z kosza do oryginalnej lokalizacji
   */
  async restoreFromTrash(trashName: string): Promise<void> {
    const parsed = this.parseTrashName(trashName);
    if (!parsed) {
      throw new NotFoundException('Invalid trash entry');
    }
    const trashPath = path.join(this.trashRoot, trashName);
    try {
      await fs.access(trashPath);
    } catch {
      throw new NotFoundException('Trash entry not found');
    }

    let target = this.pathValidator.safeJoin(parsed.originalPath);
    // Konflikt nazw — dodaj sufiks
    try {
      await fs.access(target);
      const ext = path.extname(target);
      target = `${target.slice(0, target.length - ext.length)}__restored-${Date.now()}${ext}`;
    } catch {
      // brak konfliktu
    }

    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.rename(trashPath, target);
  }

  /**
   * Usuwa wpisy z kosza starsze niż TRASH_RETENTION_DAYS
   */
  async cleanupOldTrash(): Promise<number> {
    let entries: string[];
    try {
      entries = await fs.readdir(this.trashRoot);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return 0;
      throw err;
    }

    const cutoff = Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let removed = 0;
    for (const name of entries) {
      const entryPath = path.join(this.trashRoot, name);
      try {
        const stat = await fs.stat(entryPath);
        if (stat.mtime.getTime() < cutoff) {
          await fs.rm(entryPath, { recursive: true, force: true });
          removed++;
        }
      } catch {
        // pomiń błędne wpisy
      }
    }
    if (removed > 0) {
      this.logger.log(`Trash cleanup: removed ${removed} old item(s)`);
    }
    return removed;
  }

  /**
   * Parsuje nazwę pliku w koszu na timestamp + oryginalną ścieżkę
   */
  private parseTrashName(
    name: string,
  ): { deletedAt: string; originalPath: string } | null {
    const idx = name.indexOf('__');
    if (idx === -1) return null;
    const timestamp = name.slice(0, idx);
    const encoded = name.slice(idx + 2);
    if (!encoded) return null;
    try {
      const originalPath = decodeURIComponent(encoded);
      return { deletedAt: timestamp, originalPath };
    } catch {
      // Stary format (sprzed kodowania ścieżek) — pokaż surową nazwę
      return { deletedAt: timestamp, originalPath: encoded };
    }
  }

  /**
   * Zwraca pełną ścieżkę do pliku (dla streaming)
   */
  getFilePath(relativePath: string): string {
    return this.pathValidator.safeJoin(relativePath);
  }

  /**
   * Sprawdza czy ścieżka to folder czy plik
   */
  async checkPathType(relativePath: string): Promise<{ isDir: boolean }> {
    const fullPath = this.pathValidator.safeJoin(relativePath);
    
    try {
      const stat = await fs.stat(fullPath);
      return { isDir: stat.isDirectory() };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        throw new NotFoundException('Path not found');
      }
      throw err;
    }
  }

  /**
   * Zapisuje zawartość pliku tekstowego
   */
  async saveFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this.pathValidator.safeJoin(relativePath);

    // Sprawdź czy plik istnieje
    try {
      const stat = await fs.stat(fullPath);
      if (!stat.isFile()) {
        throw new NotFoundException('Path is not a file');
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new NotFoundException('File not found');
      }
      throw err;
    }

    // Zapisz zawartość
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  /**
   * Slugify nazwy pliku (base name, bez extension)
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // usuń diakrytyki
      .replace(/[^a-z0-9]+/g, '-')     // zamień non-alphanumeric na -
      .replace(/^-+|-+$/g, '');        // usuń leading/trailing -
  }
}

