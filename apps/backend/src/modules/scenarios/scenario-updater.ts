import { promises as fs } from 'fs';
import { ScenarioDoc, ScenarioMeta, ScenarioStep } from '../../types/scenarios';
import { ScenarioLoader } from './scenario-loader';
import { parseScenarioFile, buildScenarioFile } from './scenario-parser';

export interface UpdateScenarioData {
  title?: string;
  description?: string;
  steps?: ScenarioStep[];
}

export class ScenarioUpdater {
  constructor(private readonly loader: ScenarioLoader) {}

  async updateScenario(id: string, data: UpdateScenarioData): Promise<ScenarioDoc | null> {
    const existingScenario = await this.loader.loadById(id);
    if (!existingScenario) {
      return null;
    }

    const updatedMeta: ScenarioMeta = {
      ...existingScenario.meta,
      title: data.title ?? existingScenario.meta.title,
      description: data.description ?? existingScenario.meta.description,
    };

    const updatedSteps = data.steps ?? existingScenario.steps;
    const fileContent = buildScenarioFile(updatedMeta, updatedSteps);

    const filePath = await this.findFilePath(id);
    if (!filePath) {
      return null;
    }

    await fs.writeFile(filePath, fileContent, 'utf-8');

    const rawContent = await fs.readFile(filePath, 'utf-8');
    return parseScenarioFile(rawContent);
  }

  private async findFilePath(id: string): Promise<string | null> {
    const files = await fs.readdir(this.loader.directory);
    const targetFile = files.find((file) => file.includes(`__${id}.yaml`) || file.includes(`__${id}.yml`));

    if (!targetFile) {
      return null;
    }

    return `${this.loader.directory}/${targetFile}`;
  }
}


