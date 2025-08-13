import { Module, Provider } from '@nestjs/common';
import { MikroOrmModule, getRepositoryToken } from '@mikro-orm/nestjs';
import {
  UnderscoreNamingStrategy,
  EntityManager,
} from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
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

// ── Custom repositories ─────────────────────────────────────────────────
import { UserRepository } from './repositories/user.repository';

const DB_ENTITIES = [
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

// If you haven’t set `customRepository` on the entity metadata, expose a provider token
// that returns the base repository cast to your custom class for DI convenience.
const userRepositoryProvider: Provider = {
  provide: UserRepository,
  useFactory: (em: EntityManager) => em.getRepository(User) as unknown as UserRepository,
  inject: [EntityManager],
};

@Module({
  imports: [
    // Root ORM config from env, safe defaults for dev.
    MikroOrmModule.forRootAsync({
      useFactory: () => {
        const isProd = process.env.NODE_ENV === 'production';
        const dbUrl =
          process.env.DB_URL ??
          'postgresql://root@cockroachdb:26257/helix?sslmode=disable';

        return {
          driver: PostgreSqlDriver,
          clientUrl: dbUrl,
          debug: !isProd,
          strict: true,
          allowGlobalContext: true,
          namingStrategy: UnderscoreNamingStrategy,
          entities: [...DB_ENTITIES],
          // If you compile to dist/, MikroORM will auto-pick the .js files at runtime.
          entitiesTs: [...DB_ENTITIES],
          // Register subscribers (e.g., audit)
          subscribers: [AuditSubscriber],
          extensions: [Migrator],
          migrations: {
            path: join(__dirname, '../../migrations'),
            tableName: 'mikro_orm_migrations',
            transactional: true,
            allOrNothing: true,
            emit: 'ts',
            glob: '!(*.d).{js,ts}',
          },
          // Cockroach-friendly pool
          pool: { min: 1, max: Number(process.env.DB_POOL_MAX ?? 10) },
          // Recommended when creating entities and flushing immediately
          persistOnCreate: true,
        };
      },
    }),

    // Make repositories for these entities injectable via @InjectRepository or EntityManager
    MikroOrmModule.forFeature(DB_ENTITIES as unknown as any[]),
  ],
  providers: [AuditSubscriber, userRepositoryProvider],
  exports: [MikroOrmModule, userRepositoryProvider],
})
export class DbModule {}

/*
Usage:

// app.module.ts (or your feature module)
@Module({
  imports: [
    DbModule, // now MikroORM is ready and entities are registered
  ],
})
export class AppModule {}

// injecting
@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager, private readonly users: UserRepository) {}

  async findByEmail(email: string) {
    return this.users.findByEmail(email);
  }
}

Notes:
- If you’d rather have MikroORM automatically return your custom repository via
  `em.getRepository(User)`, add `customRepository: () => UserRepository` to the
  `@Entity()` options of User. With that set, you can drop `userRepositoryProvider`
  and use `@InjectRepository(User) repo: UserRepository`.
*/
