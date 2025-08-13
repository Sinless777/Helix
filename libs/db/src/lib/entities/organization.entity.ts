import { Entity, PrimaryKey, Property, Enum, Unique, Index } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

export enum OrgPlan {
  free = 'free',
  pro = 'pro',
  enterprise = 'enterprise',
}

/**
 * Organization / Tenant
 * - Keep FKs as UUIDs to avoid cross-lib coupling for now (Membership links users↔orgs).
 * - `slug` is unique and used for URLs / multi-tenant routing.
 * - Soft-delete via `deletedAt`.
 */
@Entity({ tableName: 'organization' })
@Unique({ properties: ['slug'] })
@Index({ properties: ['ownerUserId'] })
@Index({ properties: ['plan'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['deletedAt'] })
@Index({ properties: ['suspendedAt'] })
@Index({ properties: ['externalId'] })
@Index({ properties: ['billingCustomerId'] })
export class Organization {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Human name shown in UI. */
  @Property()
  name!: string;

  /** URL-friendly slug (lowercase, unique). */
  @Property()
  slug!: string;

  /** Optional owner user (also represented by a Membership with role=owner). */
  @Property({ type: 'uuid', nullable: true })
  ownerUserId?: string | null;

  /** Contact/billing email (can differ from member emails). */
  @Property({ nullable: true })
  billingEmail?: string | null;

  /** Subscription / plan tier. */
  @Enum({ items: () => OrgPlan, type: 'string' })
  plan: OrgPlan = OrgPlan.free;

  /** Trial end timestamp for plan evaluation. */
  @Property({ nullable: true })
  trialEndsAt?: Date | null;

  /** Suspension (e.g., billing failed / compliance). */
  @Property({ nullable: true })
  suspendedAt?: Date | null;

  @Property({ nullable: true })
  suspensionReason?: string | null;

  /** Primary vanity domain for the tenant (if used). */
  @Property({ nullable: true })
  primaryDomain?: string | null;

  /** Additional allowed domains/hostnames for this tenant. */
  @Property({ type: 'text[]', nullable: true })
  domains?: string[] | null;

  /** Feature flags toggled for this org. */
  @Property({ type: 'text[]', nullable: true })
  featureFlags?: string[] | null;

  /** Arbitrary org settings/config (auth policies, MFA requirements, etc.). */
  @Property({ type: 'json', nullable: true })
  settings?: Record<string, unknown> | null;

  /** Free-form metadata for integrations, notes, etc. */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  /** External references (billing, CRM, directory). */
  @Property({ nullable: true })
  externalId?: string | null;

  @Property({ nullable: true })
  billingCustomerId?: string | null;

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
  get isSuspended(): boolean {
    return !!this.suspendedAt;
  }

  @Property({ persist: false })
  get isTrialing(): boolean {
    return !!(this.trialEndsAt && this.trialEndsAt.getTime() > Date.now());
  }

  @Property({ persist: false })
  get isActive(): boolean {
    return !this.isDeleted && !this.isSuspended;
  }
}

/*
Migration notes (Cockroach/Postgres):

-- Optional: enforce plan with a DB enum (or keep TEXT):
-- CREATE TYPE org_plan AS ENUM ('free','pro','enterprise');
-- ALTER TABLE organization ALTER COLUMN plan TYPE org_plan USING plan::org_plan;

-- If you use domains for tenant routing, consider uniqueness across all orgs:
-- CREATE UNIQUE INDEX IF NOT EXISTS ux_organization_primary_domain ON organization (primaryDomain) WHERE primaryDomain IS NOT NULL;

-- If querying json/arrays often, add inverted indexes:
-- CREATE INVERTED INDEX IF NOT EXISTS idx_organization_settings ON organization (settings);
-- CREATE INVERTED INDEX IF NOT EXISTS idx_organization_feature_flags ON organization (featureFlags);
*/
