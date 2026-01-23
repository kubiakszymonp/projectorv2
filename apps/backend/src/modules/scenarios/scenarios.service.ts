import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ScenarioDoc } from '../../types/scenarios';
import { ScenarioLoader } from './scenario-loader';
import { ScenarioCreator, CreateScenarioData } from './scenario-creator';
import { ScenarioUpdater, UpdateScenarioData } from './scenario-updater';

@Injectable()
export class ScenariosService implements OnModuleInit {
  private readonly logger = new Logger(ScenariosService.name);
  private readonly scenariosMap: Map<string, ScenarioDoc> = new Map();
  private readonly loader: ScenarioLoader;
  private readonly creator: ScenarioCreator;
  private readonly updater: ScenarioUpdater;

  constructor() {
    this.loader = new ScenarioLoader();
    this.creator = new ScenarioCreator(this.loader);
    this.updater = new ScenarioUpdater(this.loader);
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Loading scenarios into memory...');
    try {
      const scenarios = await this.loader.loadAll();
      for (const scenario of scenarios) {
        this.scenariosMap.set(scenario.meta.id, scenario);
      }
      this.logger.log(`Loaded ${this.scenariosMap.size} scenarios into memory`);
    } catch (error) {
      this.logger.error('Failed to load scenarios', error);
    }
  }

  async findAll(): Promise<ScenarioDoc[]> {
    return Array.from(this.scenariosMap.values());
  }

  async findById(id: string): Promise<ScenarioDoc | null> {
    return this.scenariosMap.get(id) || null;
  }

  async create(data: CreateScenarioData): Promise<ScenarioDoc> {
    const scenario = await this.creator.createScenario(data);
    this.scenariosMap.set(scenario.meta.id, scenario);
    this.logger.log(`Created scenario: ${scenario.meta.title} (${scenario.meta.id})`);
    return scenario;
  }

  async update(id: string, data: UpdateScenarioData): Promise<ScenarioDoc | null> {
    const scenario = await this.updater.updateScenario(id, data);
    if (scenario) {
      this.scenariosMap.set(id, scenario);
      this.logger.log(`Updated scenario: ${scenario.meta.title} (${id})`);
    }
    return scenario;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.loader.deleteScenario(id);
    if (deleted) {
      this.scenariosMap.delete(id);
      this.logger.log(`Deleted scenario: ${id}`);
    }
    return deleted;
  }

  async reloadFromDisk(): Promise<{ count: number }> {
    this.logger.log('Reloading scenarios from disk...');
    this.scenariosMap.clear();

    try {
      const scenarios = await this.loader.loadAll();
      for (const scenario of scenarios) {
        this.scenariosMap.set(scenario.meta.id, scenario);
      }
      const count = this.scenariosMap.size;
      this.logger.log(`Reloaded ${count} scenarios into memory`);
      return { count };
    } catch (error) {
      this.logger.error('Failed to reload scenarios', error);
      throw error;
    }
  }
}





