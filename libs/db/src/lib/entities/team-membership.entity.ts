import { Entity, PrimaryKey, Property, Enum, Index, Unique } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

export enum TeamMembershipRole {
  owner = 'owner',
  admin = 'admin',
  member = 'member',
}

/**
 * Team membership: links a user to a team (within an org) with a role.
 * - FKs are UUIDs to keep the db lib decoupled from other libs.
 * - Invitation lifecycle mirrors organization membership.
 */
@Entity({ tableName: 'team_membership' })
@Unique({ properties: ['teamId', 'userId'] })
@Index({ properties: ['orgId'] })
@Index({ properties: ['teamId'] })
@Index({ properties: ['userId'] })
@Index({ properties: ['role'] })
@Index({ properties: ['createdAt'] })
export class TeamMembership {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Parent organization id (denormalized for fast filtering). */
  @Property({ type: 'uuid' })
  orgId!: string;

  /** Team id */
  @Property({ type: 'uuid' })
  teamId!: string;

  /** User id */
  @Property({ type: 'uuid' })
  userId!: string;

  /** Owner/Admin/Member */
  @Enum({ items: () => TeamMembershipRole, type: 'string' })
  role: TeamMembershipRole = TeamMembershipRole.member;

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

  /** Last activity signal within the team (optional) */
  @Property({ nullable: true })
  lastSeenAt?: Date | null;

  // ─────────────────────────── derived helpers (not persisted) ───────────────────────────

  @Property({ persist: false })
  get active(): boolean {
    return !this.removedAt;
  }

  @Property({ persist: false })
  get isOwnerOrAdmin(): boolean {
    return this.role === TeamMembershipRole.owner || this.role === TeamMembershipRole.admin;
  }
}

/*
Migration hints (Cockroach/Postgres):

-- Optional enum for role:
-- CREATE TYPE team_membership_role AS ENUM ('owner','admin','member');
-- ALTER TABLE team_membership ALTER COLUMN role TYPE team_membership_role USING role::team_membership_role;

-- Useful composite index when listing team members within an org:
-- CREATE INDEX IF NOT EXISTS idx_team_membership_org_team ON team_membership (orgId, teamId);

-- If/when you add FKs:
-- ALTER TABLE team_membership ADD CONSTRAINT fk_tm_org  FOREIGN KEY (orgId)  REFERENCES organization(id);
-- ALTER TABLE team_membership ADD CONSTRAINT fk_tm_team FOREIGN KEY (teamId) REFERENCES team(id);
-- ALTER TABLE team_membership ADD CONSTRAINT fk_tm_user FOREIGN KEY (userId) REFERENCES "user"(id);
*/
