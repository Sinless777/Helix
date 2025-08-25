import { Entity, PrimaryKey, Property, Enum, Index, Unique } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

export enum MembershipRole {
  owner = 'owner',
  admin = 'admin',
  member = 'member',
}

/**
 * Organization membership: links a user to an organization with a role.
 * We store foreign keys as UUIDs to avoid cross-lib coupling; you can add real
 * relations later if desired.
 */
@Entity({ tableName: 'membership' })
@Unique({ properties: ['orgId', 'userId'] })
@Index({ properties: ['orgId'] })
@Index({ properties: ['userId'] })
@Index({ properties: ['role'] })
@Index({ properties: ['createdAt'] })
export class Membership {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Organization/tenant id */
  @Property({ type: 'uuid' })
  orgId!: string;

  /** User id */
  @Property({ type: 'uuid' })
  userId!: string;

  /** Owner/Admin/Member */
  @Enum({ items: () => MembershipRole, type: 'string' })
  role: MembershipRole = MembershipRole.member;

  /** Invitation lifecycle (optional) */
  @Property({ type: 'uuid', nullable: true })
  invitedByUserId?: string | null;

  @Property({ nullable: true })
  invitedAt?: Date | null;

  @Property({ nullable: true })
  acceptedAt?: Date | null;

  /** Removal / revocation */
  @Property({ nullable: true })
  removedAt?: Date | null;

  /** Timestamps */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  /** Last activity signal within the org (optional) */
  @Property({ nullable: true })
  lastSeenAt?: Date | null;

  // ─────────────────────────── helpers ───────────────────────────

  @Property({ persist: false })
  get active(): boolean {
    return !this.removedAt;
  }

  @Property({ persist: false })
  get isOwnerOrAdmin(): boolean {
    return this.role === MembershipRole.owner || this.role === MembershipRole.admin;
  }
}

/*
Migration hints (Cockroach/Postgres):

-- Optionally enforce role with a DB enum (or keep TEXT):
-- CREATE TYPE membership_role AS ENUM ('owner','admin','member');
-- ALTER TABLE membership ALTER COLUMN role TYPE membership_role USING role::membership_role;

-- Useful additional indexes for querying by org + role:
-- CREATE INDEX IF NOT EXISTS idx_membership_org_role ON membership (orgId, role);
*/
