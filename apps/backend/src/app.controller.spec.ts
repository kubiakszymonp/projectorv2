import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TextsService } from './modules/texts/texts.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: TextsService,
          useValue: { findAll: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should report ok status', async () => {
      const health = await appController.getHealth();
      expect(health.status).toBe('ok');
      expect(health.texts).toBe(0);
      expect(typeof health.uptimeSeconds).toBe('number');
    });
  });
});
