// libs/db/src/entities/system/waitlist.entity.ts

import { Entity, Property, Index, ManyToOne, type Rel } from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { User } from '../user/user.entity';

/**
 * WaitlistEntry
 *
 * Represents a pending registration or early access signup within the Helix ecosystem.
 * Tracks contact info, cohort metadata, and optional linkage to a {@link User} once onboarded.
 *
 * Table: system_waitlist
 */
@Entity({ tableName: 'system_waitlist' })
@Index({ name: 'idx_waitlist_email', properties: ['email'] })
@Index({ name: 'idx_waitlist_status', properties: ['status'] })
export class WaitlistEntry extends BaseEntity {
  /** User’s email address — must be unique for analytics and invites. */
  @Property({ type: 'text', unique: true })
  email!: string;

  /** Optional full name of the user. */
  @Property({ type: 'text', nullable: true })
  name?: string;

  /** Origin source of signup (e.g., "landing_page", "discord", "referral"). */
  @Property({ type: 'text', nullable: true })
  source?: string;

  /** Optional referral code or campaign identifier. */
  @Property({ type: 'text', nullable: true })
  refCode?: string;

  /** Waitlist cohort grouping (e.g., "alpha", "beta", "public"). */
  @Property({ type: 'text', nullable: true })
  cohort?: string;

  /** Current status — e.g., "pending", "invited", "joined", "archived". */
  @Property({ type: 'text', default: 'pending' })
  status = 'pending';

  /** Invite code used when the user was invited. */
  @Property({ type: 'text', nullable: true })
  inviteCode?: string;

  /** UTC timestamps marking key lifecycle moments. */
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP' })
  appliedAt: Date = new Date();

  @Property({ type: 'datetime', nullable: true })
  invitedAt?: Date;

  @Property({ type: 'datetime', nullable: true })
  joinedAt?: Date;

  /** Arbitrary metadata for analytics, source tracking, etc. */
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  /** Optional link to an existing {@link User} (if promoted to a full account). */
  @ManyToOne(() => User, { fieldName: 'user_id', nullable: true })
  user?: Rel<User>;
}
