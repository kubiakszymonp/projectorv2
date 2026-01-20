import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

/**
 * Bezpieczne łączenie ścieżek - zapobiega directory traversal
 */
export class PathValidator {
  private readonly root: string;

  constructor(rootPath: string) {
    this.root = path.resolve(rootPath);
  }

  /**
   * Łączy root z user-podaną ścieżką i waliduje bezpieczeństwo
   * Rzuca BadRequestException jeśli ścieżka wychodzi poza root
   */
  safeJoin(userPath: string): string {
    // Normalizuj i usuń niebezpieczne sekwencje
    const normalized = this.normalizePath(userPath);
    
    // Zbuduj pełną ścieżkę
    const fullPath = path.resolve(this.root, normalized);
    
    // KRYTYCZNE: sprawdź czy wynik jest w root
    if (!fullPath.startsWith(this.root)) {
      throw new BadRequestException('Invalid path: path traversal detected');
    }
    
    return fullPath;
  }

  /**
   * Zwraca względną ścieżkę od root (dla API responses)
   */
  getRelativePath(absolutePath: string): string {
    return path.relative(this.root, absolutePath);
  }

  /**
   * Normalizuje user input - blokuje niebezpieczne znaki
   */
  private normalizePath(userPath: string): string {
    if (!userPath) return '';
    
    // Blokuj absolutne ścieżki
    if (path.isAbsolute(userPath)) {
      throw new BadRequestException('Absolute paths are not allowed');
    }
    
    // Blokuj Windows drive letters
    if (/^[A-Za-z]:/.test(userPath)) {
      throw new BadRequestException('Drive letters are not allowed');
    }
    
    // Normalizuj slashes
    const normalized = userPath.replace(/\\/g, '/');
    
    // Blokuj próby wyjścia poza root
    if (normalized.includes('..')) {
      throw new BadRequestException('Path cannot contain ".."');
    }
    
    // Usuń leading/trailing slashes
    return normalized.replace(/^\/+|\/+$/g, '');
  }

  /**
   * Waliduje nazwę pliku/folderu (bez ścieżki)
   */
  validateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new BadRequestException('Name cannot be empty');
    }
    
    if (name.includes('/') || name.includes('\\')) {
      throw new BadRequestException('Name cannot contain slashes');
    }
    
    if (name === '.' || name === '..') {
      throw new BadRequestException('Name cannot be "." or ".."');
    }
    
    // Blokuj niebezpieczne znaki
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(name)) {
      throw new BadRequestException('Name contains invalid characters');
    }
  }

  getRoot(): string {
    return this.root;
  }
}

