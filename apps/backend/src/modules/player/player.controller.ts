import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PlayerService } from './player.service';
import type { ScreenState } from '../../types/player';
import { SetTextDto, SetMediaDto, SetScenarioDto, NavigateDto, SetVisibilityDto } from './dto/player.dto';

// ========== CONTROLLER ==========

@Controller('api/player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  /**
   * Pobiera aktualny stan ekranu
   * GET /api/player/state
   */
  @Get('state')
  getState(): ScreenState {
    return this.playerService.getState();
  }

  /**
   * Ustawia stan ekranu (bezpośrednia aktualizacja)
   * POST /api/player/state
   */
  @Post('state')
  @HttpCode(HttpStatus.OK)
  setState(@Body() state: ScreenState): ScreenState {
    return this.playerService.setState(state);
  }

  /**
   * Czyści ekran
   * POST /api/player/clear
   */
  @Post('clear')
  @HttpCode(HttpStatus.OK)
  clearScreen(): ScreenState {
    return this.playerService.clearScreen();
  }

  /**
   * Ustawia tekst do wyświetlenia
   * POST /api/player/text
   */
  @Post('text')
  @HttpCode(HttpStatus.OK)
  async setText(@Body() dto: SetTextDto): Promise<ScreenState> {
    return this.playerService.setText(dto.textRef, dto.slideIndex ?? 0);
  }

  /**
   * Ustawia medium do wyświetlenia
   * POST /api/player/media
   */
  @Post('media')
  @HttpCode(HttpStatus.OK)
  setMedia(@Body() dto: SetMediaDto): ScreenState {
    return this.playerService.setMedia(dto.type, dto.path);
  }

  /**
   * Uruchamia scenariusz
   * POST /api/player/scenario
   */
  @Post('scenario')
  @HttpCode(HttpStatus.OK)
  async setScenario(@Body() dto: SetScenarioDto): Promise<ScreenState> {
    return this.playerService.setScenario(dto.scenarioId, dto.stepIndex ?? 0);
  }

  /**
   * Nawigacja slajdów (prev/next) - dla tekstu
   * POST /api/player/slide
   */
  @Post('slide')
  @HttpCode(HttpStatus.OK)
  async navigateSlide(@Body() dto: NavigateDto): Promise<ScreenState> {
    return this.playerService.navigateSlide(dto.direction);
  }

  /**
   * Nawigacja kroków scenariusza (prev/next)
   * POST /api/player/step
   */
  @Post('step')
  @HttpCode(HttpStatus.OK)
  async navigateStep(@Body() dto: NavigateDto): Promise<ScreenState> {
    return this.playerService.navigateStep(dto.direction);
  }

  /**
   * Przełącza widoczność zawartości
   * POST /api/player/toggle-visibility
   */
  @Post('toggle-visibility')
  @HttpCode(HttpStatus.OK)
  toggleVisibility(): ScreenState {
    return this.playerService.toggleVisibility();
  }

  /**
   * Ustawia widoczność zawartości
   * POST /api/player/visibility
   */
  @Post('visibility')
  @HttpCode(HttpStatus.OK)
  setVisibility(@Body() dto: SetVisibilityDto): ScreenState {
    return this.playerService.setVisibility(dto.visible);
  }
}

