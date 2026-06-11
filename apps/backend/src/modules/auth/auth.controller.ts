import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AUTH_COOKIE } from './auth.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Czy panel wymaga PIN i czy bieżący klient jest zalogowany.
   */
  @Get('status')
  @ApiOperation({ summary: 'Status autoryzacji panelu' })
  status(@Req() req: Request): { authRequired: boolean; authenticated: boolean } {
    const token = this.cookie(req)[AUTH_COOKIE];
    return {
      authRequired: this.authService.isAuthEnabled(),
      authenticated:
        !this.authService.isAuthEnabled() ||
        this.authService.validateToken(token),
    };
  }

  /**
   * Logowanie PIN-em — ustawia ciasteczko sesji.
   */
  @Post('login')
  @ApiOperation({ summary: 'Logowanie PIN-em' })
  login(
    @Body('pin') pin: string,
    @Res({ passthrough: true }) res: Response,
  ): { success: boolean } {
    if (!this.authService.isAuthEnabled()) {
      return { success: true }; // auth wyłączony
    }
    if (!pin || !this.authService.verifyPin(pin)) {
      throw new UnauthorizedException('Invalid PIN');
    }
    const token = this.authService.createSession();
    res.cookie(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dni
    });
    return { success: true };
  }

  /**
   * Wylogowanie.
   */
  @Post('logout')
  @ApiOperation({ summary: 'Wylogowanie' })
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { success: boolean } {
    this.authService.revokeToken(this.cookie(req)[AUTH_COOKIE]);
    res.clearCookie(AUTH_COOKIE);
    return { success: true };
  }

  /**
   * Ustaw/zmień PIN. Pusty PIN wyłącza autoryzację.
   * Gdy PIN już istnieje, wymaga zalogowania.
   */
  @Post('pin')
  @ApiOperation({ summary: 'Ustaw lub zmień PIN' })
  async setPin(
    @Body('pin') pin: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    if (this.authService.isAuthEnabled()) {
      const token = this.cookie(req)[AUTH_COOKIE];
      if (!this.authService.validateToken(token)) {
        throw new UnauthorizedException('PIN required to change PIN');
      }
    }
    if (pin && pin.length < 4) {
      throw new BadRequestException('PIN must be at least 4 digits');
    }
    await this.authService.setPin(pin ?? '');
    return { success: true };
  }

  private cookie(req: Request): Record<string, string> {
    const out: Record<string, string> = {};
    const header = req.headers.cookie;
    if (!header) return out;
    for (const part of header.split(';')) {
      const idx = part.indexOf('=');
      if (idx === -1) continue;
      out[part.slice(0, idx).trim()] = decodeURIComponent(
        part.slice(idx + 1).trim(),
      );
    }
    return out;
  }
}
