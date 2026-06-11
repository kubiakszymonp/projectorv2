import * as path from 'path';

/**
 * Single source for the data directory. Configurable via DATA_DIR env var
 * (absolute or relative to cwd); falls back to <repo>/data (two levels up from
 * apps/backend, which is the cwd in dev and in the Docker image).
 */
export function getDataDir(): string {
  const fromEnv = process.env.DATA_DIR;
  if (fromEnv && fromEnv.trim()) {
    return path.resolve(fromEnv);
  }
  return path.resolve(process.cwd(), '..', '..', 'data');
}

/** Join segments under the data directory. */
export function getDataPath(...segments: string[]): string {
  return path.resolve(getDataDir(), ...segments);
}
