// libs/db/src/mikroorm-config.ts

import './register-env';

import { defineConfig } from '@mikro-orm/postgresql';
import * as entities from './entities';

// Prefer explicit Postgres URLs; DO NOT use the HTTP Supabase URL here.
const resolvedClientUrl =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  '';

export const hasDatabaseUrl = !!resolvedClientUrl;

if (!hasDatabaseUrl) {
  // Fail fast with a clear message instead of silently trying localhost:5432
  // You can downgrade this to a console.warn if you want to allow no-DB mode.
  // eslint-disable-next-line no-console
  console.error(
    '[helix-db] No Postgres connection string found. ' +
      'Set POSTGRES_URL / POSTGRES_PRISMA_URL / DATABASE_URL.',
  );
}

export default defineConfig({
  entities: Object.values(entities),

  // 🔑 Use a proper Postgres connection string (Supabase pooler, etc.)
  // Example from your .env.local:
  // POSTGRES_URL="postgres://...@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=..."
  clientUrl: resolvedClientUrl || undefined,

  // You can optionally still pass dbName/host if you want,
  // but clientUrl is enough and usually preferred.
  dbName: process.env.POSTGRES_DATABASE || 'postgres',

  driverOptions: {
    // Supabase requires SSL
    connection: { ssl: { rejectUnauthorized: false } },
  },

  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },

  debug: process.env.NODE_ENV !== 'production',

  migrations: {
    path: './libs/shared/db/src/migrations',
    pathTs: './libs/shared/db/src/migrations',
    tableName: 'mikroorm_migrations',
    emit: 'ts',
  },

  seeder: {
    path: './libs/shared/db/src/seeders',
    pathTs: './libs/shared/db/src/seeders',
    defaultSeeder: 'DatabaseSeeder',
  },

  discovery: { warnWhenNoEntities: true },
  extensions: [],
});
