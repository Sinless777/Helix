import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import {
  UnderscoreNamingStrategy,
} from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { join } from 'node:path';

// ── Entities ─────────────────────────────────────────────────────────────
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserLanguage } from './entities/user-language.entity';
import { UserPreference } from './entities/user-preference.entity';
import { Organization } from './entities/organization.entity';
import { Team } from './entities/team.entity';
import { Membership } from './entities/membership.entity';
import { TeamMembership } from './entities/team-membership.entity';
import { ApiKey } from './entities/api-key.entity';
import { OAuthIdentity } from './entities/oauth-identity.entity';
import { MfaTotp } from './entities/mfa-totp.entity';
import { WebAuthnCredential } from './entities/webauthn-credential.entity';
import { AuditLog } from './entities/audit-log.entity';
import { TrustedDevice } from './entities/trusted-device.entity';

// ── Subscribers ─────────────────────────────────────────────────────────
import { AuditSubscriber } from './subscribers/audit.subscriber';

const isProd = process.env.NODE_ENV === 'production';
const dbUrl =
  process.env.DB_URL ??
  'postgresql://root@cockroachdb:26257/helix?sslmode=disable';

const entities = [
  User,
  UserProfile,
  UserLanguage,
  UserPreference,
  Organization,
  Team,
  Membership,
  TeamMembership,
  ApiKey,
  OAuthIdentity,
  MfaTotp,
  WebAuthnCredential,
  AuditLog,
  TrustedDevice,
] as const;

export const mikroOrmOptions = defineConfig({
  driver: PostgreSqlDriver,
  clientUrl: dbUrl,
  debug: !isProd,
  strict: true,
  allowGlobalContext: true,
  namingStrategy: UnderscoreNamingStrategy,

  // Entity registration for runtime (JS) and dev (TS)
  entities: [...entities],
  entitiesTs: [...entities],

  // Subscribers & extensions
  subscribers: [AuditSubscriber],
  extensions: [Migrator],

  // Migrations
  migrations: {
    path: join(__dirname, '../../migrations'),
    tableName: 'mikro_orm_migrations',
    transactional: true,
    allOrNothing: true,
    emit: 'ts',
    glob: '!(*.d).{js,ts}',
  },

  // Pool & perf
  pool: { min: 1, max: Number(process.env.DB_POOL_MAX ?? 10) },
  persistOnCreate: true,
});

export default mikroOrmOptions;

/*
Usage:

// mikro-orm.config.ts at repo root (option A):
export { default } from './libs/db/src/lib/mikro-orm.options';

// Or import wherever needed:
import { mikroOrmOptions } from './libs/db/src/lib/mikro-orm.options';
*/
