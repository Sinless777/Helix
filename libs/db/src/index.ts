
// libs/db/src/index.ts

/**
 * 🧠 Helix Database Library
 *
 * Central export surface for all MikroORM entities, configuration, and utilities.
 *
 * Usage:
 * ```ts
 * import { ormConfig, appEntities } from '@helix/db';
 * import { User, Org } from '@helix/db/entities';
 * ```
 */

import ormConfig from './mikroorm-config';
export { ormConfig };

// Export all entity classes
export * as entities from './entities';
export * from './entities';

// Export the BaseEntity
export * from './entity.base';

// Re-export MikroORM types for convenience
export type {
  EntityName,
  EntityManager,
  RequiredEntityData,
  Opt,
} from '@mikro-orm/core';

// Optional: export helper function to load ORM
import { MikroORM } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';

/**
 * Initialize and return a ready MikroORM instance.
 *
 * ```ts
 * const orm = await initOrm();
 * const em = orm.em.fork();
 * ```
 */
export async function initOrm() {
  return await MikroORM.init<PostgreSqlDriver>(ormConfig);
}
