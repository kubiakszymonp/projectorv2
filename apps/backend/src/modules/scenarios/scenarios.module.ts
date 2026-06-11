import { Module } from '@nestjs/common';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { ScenarioLoader } from './scenario-loader';
import { ScenarioCreator } from './scenario-creator';
import { ScenarioUpdater } from './scenario-updater';

@Module({
  controllers: [ScenariosController],
  providers: [ScenariosService, ScenarioLoader, ScenarioCreator, ScenarioUpdater],
  exports: [ScenariosService],
})
export class ScenariosModule {}
