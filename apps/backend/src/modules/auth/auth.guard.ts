import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

export const AUTH_COOKIE = 'projector_auth';

/**
 * Global guard: when a PIN is configured, mutating requests (POST/PUT/PATCH/
 * DELETE) require a valid session cookie. GET/HEAD/OPTIONS and /api/auth/*
 * stay open so the public display keeps working without login.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    // Only guard HTTP (websocket events are separate)
    if (context.getType() !== 'http') return true;

    const req = context.switchToHttp().getRequest<Request>();

    // Auth disabled until a PIN is set
    if (!this.authService.isAuthEnabled()) return true;

    // Read-only requests are always allowed (the TV display only reads)
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return true;
    }

    // Auth endpoints (login/logout/status) must stay reachable
    if (req.path.startsWith('/api/auth')) return true;

    const token = this.parseCookie(req.headers.cookie)[AUTH_COOKIE];
    if (this.authService.validateToken(token)) return true;

    throw new UnauthorizedException('PIN required');
  }

  private parseCookie(header?: string): Record<string, string> {
    const out: Record<string, string> = {};
    if (!header) return out;
    for (const part of header.split(';')) {
      const idx = part.indexOf('=');
      if (idx === -1) continue;
      out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    }
    return out;
  }
}
