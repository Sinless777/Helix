import { Entity, PrimaryKey, Property, Unique, Index } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

export type ApiKeyScope = string; // e.g. "org.read", "users.write", "keys.manage"

export interface ApiKeyRestrictions {
  /** IPv4/IPv6 CIDRs or bare IPs (e.g., "10.0.0.0/8", "2001:db8::/32"). */
  ipAllowlist?: string[];
  /** Allowed request origins (scheme + host[:port]), e.g. "https://app.example.com". */
  originAllowlist?: string[];
  /** Allowed Referer hosts/patterns if you want to enforce referrers. */
  referrerAllowlist?: string[];
  /** Allowed API route prefixes (e.g., "/api/v1/orgs", "/trpc/v1/*"). */
  validPaths?: string[];
}

/**
 * API key entity (service-to-service & user/org-scoped).
 * Store only HASHED secrets. The plaintext is shown once on creation.
 */
@Entity({ tableName: 'api_key' })
@Unique({ properties: ['publicId'] })           // stable identifier exposed in logs/headers
@Unique({ properties: ['prefix'] })             // short prefix, handy for identification
@Unique({ properties: ['hashedKey'] })          // prevent accidental duplicates
@Unique({ properties: ['orgId', 'name'] })      // unique name per org
@Index({ properties: ['orgId'] })
@Index({ properties: ['userId'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['lastUsedAt'] })
export class ApiKey {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /**
   * Public identifier (safe to expose) used for referencing the key in logs/headers.
   * Keep distinct from the DB id so you can rotate without breaking references.
   */
  @Property()
  publicId: string = `key_${randomUUID()}`;

  /** Optional owner: organization (tenant). Keep as UUID to avoid early dependency on Org entity. */
  @Property({ type: 'uuid', nullable: true })
  orgId?: string | null;

  /** Optional owner: user (for personal keys). */
  @Property({ type: 'uuid', nullable: true })
  userId?: string | null;

  /** Friendly label (unique within an org). */
  @Property()
  name!: string;

  /**
   * Short fixed prefix that is included in the plaintext shown to the client.
   * e.g., "hxa_live_" — helps identify keys without revealing the secret.
   */
  @Property()
  prefix!: string;

  /**
   * Hash of the full secret using a modern KDF (argon2id recommended).
   * Format suggestion: "argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>"
   */
  @Property({ hidden: true })
  hashedKey!: string;

  /**
   * Optional hint (last 8 chars of the plaintext) to help support/debugging
   * identify which key a user is talking about without storing the secret.
   */
  @Property({ length: 8, nullable: true })
  lastEight?: string | null;

  /** Fine-grained scopes. Stored as Postgres text[] (Cockroach supports arrays). */
  @Property({ type: 'text[]' })
  scopes: ApiKeyScope[] = [];

  /** Arbitrary restrictions for zero-trust enforcement (IP/origin/path allowlists, etc.). */
  @Property({ type: 'json', nullable: true })
  restrictions?: ApiKeyRestrictions | null;

  /** Optional metadata (provisioner, notes, automation id, etc.). */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  /** Timestamps */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  /** Lifecycle */
  @Property({ nullable: true })
  expiresAt?: Date | null;

  @Property({ nullable: true })
  revokedAt?: Date | null;

  /** Usage */
  @Property({ nullable: true })
  lastUsedAt?: Date | null;

  /**
   * Cockroach BIGINT maps to JS string to avoid precision issues.
   * The serializer keeps it stringy when returning JSON.
   */
  @Property({
    type: 'bigint',
    nullable: true,
    serializer: (v: any) => (v == null ? null : v.toString()),
  })
  usageCount?: string | null;

  // ─────────────────────────────── helpers ───────────────────────────────

  /** Mark as used "now" and bump count (call in a transactional context). */
  touchUsage(now = new Date()): void {
    this.lastUsedAt = now;
    const n = this.usageCount ? BigInt(this.usageCount) : 0n;
    this.usageCount = (n + 1n).toString();
  }

  /** Virtual/computed flag (not persisted). */
  @Property({ persist: false })
  get disabled(): boolean {
    if (this.revokedAt) return true;
    if (this.expiresAt && this.expiresAt.getTime() <= Date.now()) return true;
    return false;
  }
}

/*
  Migration hints:

  -- For array/json filtering performance, consider inverted indexes:
     CREATE INVERTED INDEX IF NOT EXISTS idx_api_key_scopes ON api_key (scopes);
     CREATE INVERTED INDEX IF NOT EXISTS idx_api_key_restrictions ON api_key (restrictions);

  -- If you later add FK relations:
     ALTER TABLE api_key ADD CONSTRAINT api_key_org_fk  FOREIGN KEY (orgId)  REFERENCES organization(id);
     ALTER TABLE api_key ADD CONSTRAINT api_key_user_fk FOREIGN KEY (userId) REFERENCES "user"(id);
*/
