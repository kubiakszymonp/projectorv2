import { promises as fs } from 'fs';
import { ulid } from 'ulid';
import slugify from 'slugify';
import { ScenarioMeta, ScenarioDoc, ScenarioStep } from '../../types/scenarios';
import { ScenarioLoader } from './scenario-loader';
import { buildScenarioFile } from './scenario-parser';

export interface CreateScenarioData {
  title: string;
  description?: string;
  steps?: ScenarioStep[];
}

export class ScenarioCreator {
  constructor(private readonly loader: ScenarioLoader) {}

  async createScenario(data: CreateScenarioData): Promise<ScenarioDoc> {
    const id = ulid();
    const slug = slugify(data.title, {
      lower: true,
      strict: true,
      locale: 'pl',
    });

    const meta: ScenarioMeta = {
      schemaVersion: 'scenario-1',
      id,
      title: data.title,
      description: data.description || '',
    };

    const steps = data.steps || [];
    const fileContent = buildScenarioFile(meta, steps);
    const filePath = this.loader.getFilePath(slug, id);

    await fs.writeFile(filePath, fileContent, 'utf-8');

    const scenario = await this.loader.loadById(id);
    if (!scenario) {
      throw new Error('Failed to load created scenario');
    }

    return scenario;
  }
}





