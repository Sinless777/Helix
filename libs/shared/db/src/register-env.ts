import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

const connectionEnvKeys = [
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
];

const hasConnectionDetails = connectionEnvKeys.some((key) => !!process.env[key]);

if (!hasConnectionDetails) {
  const workspaceRoot = process.env.NX_WORKSPACE_ROOT || process.cwd();
  const candidates = [
    process.env.MIKRO_ORM_ENV_FILE,
    '.env.local',
    '.env',
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const envPath = isAbsolute(candidate)
      ? candidate
      : resolve(workspaceRoot, candidate);

    if (existsSync(envPath)) {
      loadEnv({ path: envPath, override: false });
      break;
    }
  }
}
