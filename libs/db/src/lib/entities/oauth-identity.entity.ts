import { Entity, PrimaryKey, Property, Enum, Index, Unique } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

export enum OAuthProvider {
  google = 'google',
  github = 'github',
  facebook = 'facebook',
  discord = 'discord',
}

/**
 * Third-party identity linked to a (optional) user account.
 * - Encrypted tokens live in `accessTokenEnc`/`refreshTokenEnc` (store ciphertext only).
 * - Unique constraints prevent duplicate links per provider.
 */
@Entity({ tableName: 'oauth_identity' })
@Index({ properties: ['provider'] })
@Index({ properties: ['userId'] })
@Index({ properties: ['email'] })
@Unique({ properties: ['provider', 'providerUserId'] }) // one record per provider account
@Unique({ properties: ['userId', 'provider'] })         // a user can have at most one per provider
export class OAuthIdentity {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Owning user (nullable until link is completed). */
  @Property({ type: 'uuid', nullable: true })
  userId?: string | null;

  /** Provider (google/github/facebook/discord). */
  @Enum({ items: () => OAuthProvider, type: 'string' })
  provider!: OAuthProvider;

  /** Provider's stable account identifier (subject / id). */
  @Property()
  providerUserId!: string;

  /** Optional handle/username at the provider. */
  @Property({ nullable: true })
  providerUsername?: string | null;

  /** Profile basics (for personalization & display). */
  @Property({ nullable: true })
  displayName?: string | null;

  @Property({ nullable: true })
  avatarUrl?: string | null;

  /** Email at the provider (may differ from app email). */
  @Property({ nullable: true })
  email?: string | null;

  @Property({ default: false })
  emailVerified: boolean = false;

  /** OAuth scopes granted by the user. */
  @Property({ type: 'text[]', nullable: true })
  scopes?: string[] | null;

  /** Token material — store *encrypted* values only. */
  @Property({ hidden: true, nullable: true })
  accessTokenEnc?: string | null;

  @Property({ hidden: true, nullable: true })
  refreshTokenEnc?: string | null;

  /** Access token expiry, if provided by the provider. */
  @Property({ nullable: true })
  tokenExpiresAt?: Date | null;

  /** Link lifecycle & usage signals. */
  @Property({ onCreate: () => new Date() })
  linkedAt: Date = new Date();

  @Property({ nullable: true })
  unlinkedAt?: Date | null;

  @Property({ nullable: true })
  lastSignInAt?: Date | null;

  /** Housekeeping */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  // ─────────────────────────── Derived flags (not persisted) ───────────────────────────

  @Property({ persist: false })
  get isLinked(): boolean {
    return !!this.userId && !this.unlinkedAt;
  }

  @Property({ persist: false })
  get providerAccountLabel(): string {
    return `${this.provider}:${this.providerUsername ?? this.providerUserId}`;
  }

  // ─────────────────────────── Domain helpers ───────────────────────────

  /** Mark this identity as linked to a user. Resets unlink marker. */
  linkToUser(userId: string, when = new Date()): void {
    this.userId = userId;
    this.linkedAt = when;
    this.unlinkedAt = null;
  }

  /**
   * Unlink the identity. Optionally scrub stored tokens.
   * (Recommended: scrub by default for zero-trust.)
   */
  unlink(scrubTokens = true, when = new Date()): void {
    this.unlinkedAt = when;
    if (scrubTokens) {
      this.accessTokenEnc = null;
      this.refreshTokenEnc = null;
      this.tokenExpiresAt = null;
      this.scopes = null;
    }
  }

  /** Record a successful sign-in via this identity. */
  markSignIn(when = new Date()): void {
    this.lastSignInAt = when;
  }
}

/*
Migration notes (Cockroach/Postgres):

-- If you want DB-side enum for provider:
-- CREATE TYPE oauth_provider AS ENUM ('google','github','facebook','discord');
-- ALTER TABLE oauth_identity ALTER COLUMN provider TYPE oauth_provider USING provider::oauth_provider;

-- Helpful extra index for lookup by (userId, providerUserId):
-- CREATE INDEX IF NOT EXISTS idx_oauth_identity_user_providerid ON oauth_identity (userId, providerUserId);
*/
