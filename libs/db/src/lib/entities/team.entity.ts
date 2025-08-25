import { Entity, PrimaryKey, Property, Unique, Index } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

/**
 * Team (within an Organization/Tenant)
 * - `slug` is unique per org for clean URLs.
 * - Soft-delete via `deletedAt`.
 * - Keep FKs as UUIDs to avoid coupling; you can add relations later.
 */
@Entity({ tableName: 'team' })
@Unique({ properties: ['orgId', 'slug'] })
@Index({ properties: ['orgId'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['deletedAt'] })
export class Team {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Parent organization id */
  @Property({ type: 'uuid' })
  orgId!: string;

  /** Human-readable name */
  @Property()
  name!: string;

  /** URL-friendly slug (unique within an org) */
  @Property()
  slug!: string;

  /** Optional description shown in UI */
  @Property({ nullable: true })
  description?: string | null;

  /** Feature flags toggled for this team (inherits from org by default) */
  @Property({ type: 'text[]', nullable: true })
  featureFlags?: string[] | null;

  /** Arbitrary team settings/config */
  @Property({ type: 'json', nullable: true })
  settings?: Record<string, unknown> | null;

  /** Free-form metadata for integrations/notes */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  /** Timestamps */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  /** Soft-delete */
  @Property({ nullable: true })
  deletedAt?: Date | null;

  // ─────────────────────────── Derived helpers (not persisted) ───────────────────────────

  @Property({ persist: false })
  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  @Property({ persist: false })
  get isActive(): boolean {
    return !this.deletedAt;
  }
}

/*
Migration notes (Cockroach/Postgres):

-- Helpful composite index for lookups by org+slug is already enforced via UNIQUE.
-- If you’ll query JSON/arrays often, consider inverted indexes:
--   CREATE INVERTED INDEX IF NOT EXISTS idx_team_settings ON team (settings);
--   CREATE INVERTED INDEX IF NOT EXISTS idx_team_feature_flags ON team (featureFlags);
*/
