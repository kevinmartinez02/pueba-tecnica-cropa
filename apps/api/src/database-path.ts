import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const apiRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);

export function resolveDatabasePath(configuredPath?: string): string {
  const databasePath = resolve(apiRoot, configuredPath ?? 'data/app.sqlite');
  mkdirSync(dirname(databasePath), { recursive: true });
  return databasePath;
}
