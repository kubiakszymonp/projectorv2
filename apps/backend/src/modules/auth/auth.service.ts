import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { getDataPath } from '../../common/paths';

interface AuthConfig {
  salt: string;
  pinHash: string;
}

/**
 * Simple PIN-based auth for the control panel.
 * - Auth is DISABLED until a PIN is set (so a fresh install / the TV never
 *   gets locked out).
 * - Read-only (GET) requests and the socket stay open; only mutations require
 *   a valid session cookie (enforced by AuthGuard).
 */
@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly configDir: string;
  private readonly configPath: string;
  private config: AuthConfig | null = null;
  private readonly validTokens = new Set<string>();

  constructor() {
    this.configDir = getDataPath('settings');
    this.configPath = path.resolve(this.configDir, 'auth.json');
  }

  async onModuleInit(): Promise<void> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(content) as AuthConfig;
    } catch {
      this.config = null; // brak PIN — auth wyłączony
    }
  }

  isAuthEnabled(): boolean {
    return this.config !== null;
  }

  private hash(pin: string, salt: string): string {
    return crypto.scryptSync(pin, salt, 64).toString('hex');
  }

  /**
   * Set or change the PIN. Empty pin disables auth.
   */
  async setPin(pin: string): Promise<void> {
    if (!pin) {
      this.config = null;
      this.validTokens.clear();
      await fs.rm(this.configPath, { force: true });
      this.logger.log('Auth disabled (PIN cleared)');
      return;
    }
    const salt = crypto.randomBytes(16).toString('hex');
    this.config = { salt, pinHash: this.hash(pin, salt) };
    await fs.mkdir(this.configDir, { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(this.config), 'utf-8');
    this.logger.log('Auth PIN set');
  }

  verifyPin(pin: string): boolean {
    if (!this.config) return false;
    const candidate = this.hash(pin, this.config.salt);
    const a = Buffer.from(candidate, 'hex');
    const b = Buffer.from(this.config.pinHash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  createSession(): string {
    const token = crypto.randomBytes(24).toString('hex');
    this.validTokens.add(token);
    return token;
  }

  validateToken(token: string | undefined): boolean {
    return !!token && this.validTokens.has(token);
  }

  revokeToken(token: string | undefined): void {
    if (token) this.validTokens.delete(token);
  }
}
