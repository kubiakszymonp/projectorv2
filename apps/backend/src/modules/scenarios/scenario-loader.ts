import { promises as fs } from 'fs';
import * as path from 'path';
import { ScenarioDoc } from '../../types/scenarios';
import { parseScenarioFile } from './scenario-parser';

// Backend runs from apps/backend, so we need to go up to workspace root
const SCENARIOS_DIR = path.resolve(process.cwd(), '..', '..', 'data', 'scenarios');

export class ScenarioLoader {
  private readonly scenariosDirectory: string;

  constructor(scenariosDirectory?: string) {
    this.scenariosDirectory = scenariosDirectory || SCENARIOS_DIR;
  }

  async loadAll(): Promise<ScenarioDoc[]> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.scenariosDirectory);
    const yamlFiles = files.filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'));

    const scenarios = await Promise.all(
      yamlFiles.map((file) => this.loadByFilename(file)),
    );

    return scenarios;
  }

  async loadById(id: string): Promise<ScenarioDoc | null> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.scenariosDirectory);
    const targetFile = files.find((file) => file.includes(`__${id}.yaml`) || file.includes(`__${id}.yml`));

    if (!targetFile) {
      return null;
    }

    return this.loadByFilename(targetFile);
  }

  private async loadByFilename(filename: string): Promise<ScenarioDoc> {
    const filePath = path.join(this.scenariosDirectory, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return parseScenarioFile(content);
  }

  async deleteScenario(id: string): Promise<boolean> {
    await this.ensureDirectory();

    const files = await fs.readdir(this.scenariosDirectory);
    const targetFile = files.find((file) => file.includes(`__${id}.yaml`) || file.includes(`__${id}.yml`));

    if (!targetFile) {
      return false;
    }

    const filePath = path.join(this.scenariosDirectory, targetFile);
    await fs.unlink(filePath);
    return true;
  }

  private async ensureDirectory(): Promise<void> {
    try {
      await fs.access(this.scenariosDirectory);
    } catch {
      await fs.mkdir(this.scenariosDirectory, { recursive: true });
    }
  }

  getFilePath(slug: string, id: string): string {
    return path.join(this.scenariosDirectory, `${slug}__${id}.yaml`);
  }

  get directory(): string {
    return this.scenariosDirectory;
  }
}

