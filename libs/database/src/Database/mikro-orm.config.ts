import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Options, MikroORM } from '@mikro-orm/core'
import { entities } from './entities'
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'

/**
 * MikroORM configuration options for CockroachDB.
 *
 * Reads connection parameters from environment variables with sensible defaults:
 * - COCKROACHDB_HOST (default: 'localhost')
 * - COCKROACHDB_PORT (default: 26257)
 * - COCKROACHDB_USER (default: 'helix')
 * - COCKROACHDB_PASSWORD (default: 'helix')
 * - COCKROACHDB_NAME (default: 'helix')
 *
 * Enables reflection-based metadata discovery and caching for performance.
 */
export const mikroOrmConfig: Options = {
  entities,
  metadataProvider: TsMorphMetadataProvider,
  metadataCache: { enabled: true, pretty: true },
  discovery: {
    warnWhenNoEntities: false,
    requireEntitiesArray: true,
    alwaysAnalyseProperties: false,
  },
  driverOptions: {
    connection: {
      host: process.env.COCKROACHDB_HOST || 'localhost',
      port: Number(process.env.COCKROACHDB_PORT) || 26257,
      user: process.env.COCKROACHDB_USER || 'helix',
      password: process.env.COCKROACHDB_PASSWORD || 'helix',
      database: process.env.COCKROACHDB_NAME || 'helix',
      ssl: { rejectUnauthorized: false },
    },
  },
}

/**
 * AWS S3 client configuration object.
 *
 * Environment variables supported:
 * - AWS_REGION (default: 'us-east-1')
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - S3_ENDPOINT (optional custom endpoint, e.g. for MinIO)
 *
 * `forcePathStyle` is enabled when a custom endpoint is provided.
 */
export const s3Config: S3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: Boolean(process.env.S3_ENDPOINT),
}

/**
 * Preconfigured S3 client for AWS or S3-compatible object stores.
 */
export const s3Client = new S3Client(s3Config)

/**
 * Cloudflare R2 client configuration (S3-compatible).
 *
 * Reads Cloudflare R2 credentials and endpoint:
 * - CF_ACCOUNT_ID
 * - CF_R2_ACCESS_KEY_ID
 * - CF_R2_SECRET_ACCESS_KEY
 * - CF_R2_REGION (default: 'auto')
 * - CF_R2_ENDPOINT (optional override)
 */
export const r2Config: S3ClientConfig = {
  endpoint:
    process.env.CF_R2_ENDPOINT ||
    `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: process.env.CF_R2_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
}

/**
 * Preconfigured S3 client specifically targeting Cloudflare R2.
 */
export const r2Client = new S3Client(r2Config)

/**
 * Initialized MikroORM instance. Use this to bootstrap your application.
 *
 * Example:
 * ```ts
 * import { orm } from './mikro-orm.config';
 *
 * async function start() {
 *   const em = (await orm).em;
 *   // ... use entity manager
 * }
 * ```
 */
export const orm = MikroORM.init(mikroOrmConfig)

/**
 * Promise resolving to the MikroORM EntityManager.
 *
 * Await this to get a ready-to-use EntityManager:
 * ```ts
 * const em = await entityManager;
 * ```
 */
export const entityManager = orm.then((instance) => instance.em)
