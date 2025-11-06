// libs/db/src/mikroorm-config.ts

import { defineConfig } from '@mikro-orm/postgresql';
import { appConfig } from '@helix/config';
import * as entities from './entities';

/**
 * MikroORM configuration for Helix DB.
 *
 * Dynamically loads environment settings from @helix/config,
 * supporting Postgres, Redis, and secure connection parameters.
 */
export default defineConfig({
  entities: Object.values(entities),
  clientUrl: appConfig.supabase.url,
  driverOptions: {
    connection: { ssl: { rejectUnauthorized: false } },
  },
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './migrations',
    pathTs: './migrations',
    tableName: 'mikroorm_migrations',
    emit: 'ts',
  },
  seeder: {
    path: './seeders',
    pathTs: './seeders',
    defaultSeeder: 'DatabaseSeeder',
  },
  discovery: { warnWhenNoEntities: true },
  extensions: [],
});
