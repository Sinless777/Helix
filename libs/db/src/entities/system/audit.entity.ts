// libs/db/src/entities/system/audit.entity.ts

import {
  Entity,
  Property,
  Index,
  ManyToOne,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { User } from '../user/user.entity';
import { Org } from '../org/org.entity';

/**
 * Represents an authorization or access control event for auditing.
 * Each record captures:
 * - The actor (User / Org)
 * - The attempted action & resource
 * - The resulting decision (allow/deny)
 * - Contextual and feature flag metadata
 *
 * Table: system_audit
 */
@Entity({ tableName: 'system_audit' })
@Index({ name: 'idx_audit_user_time', properties: ['user', 'timestamp'] })
@Index({ name: 'idx_audit_org_time', properties: ['org', 'timestamp'] })
export class Audit extends BaseEntity {
  /** The user who triggered this action (if applicable). */
  @ManyToOne(() => User, { fieldName: 'user_id', nullable: true })
  user?: Rel<User>;

  /** The organization context in which the action occurred. */
  @ManyToOne(() => Org, { fieldName: 'org_id', nullable: true })
  org?: Rel<Org>;

  /** The user’s effective role at the time of the event. */
  @Property({ type: 'text', nullable: true })
  role?: string | null;

  /** The action performed (e.g., 'create_ticket', 'update_profile'). */
  @Property({ type: 'text' })
  action!: string;

  /** The resource on which the action was attempted (e.g., 'user.profile'). */
  @Property({ type: 'text' })
  resource!: string;

  /** Additional request context such as IP, user-agent, etc. */
  @Property({ type: 'jsonb', nullable: true })
  attributes?: Record<string, unknown>;

  /** The result of the access control evaluation. */
  @Property({ type: 'text' })
  result!: 'allow' | 'deny';

  /** Optional reason or policy reference explaining the result. */
  @Property({ type: 'text', nullable: true })
  reason?: string;

  /** Whether a feature flag influenced this decision. */
  @Property({ type: 'boolean', default: false })
  featureFlagChecked = false;

  /** Name of the feature flag (if one applied). */
  @Property({ type: 'text', nullable: true })
  featureFlagName?: string;

  /** Millisecond timestamp for chronological sorting and retention. */
  @Property({ type: 'bigint', default: Date.now() })
  timestamp: number = Date.now();
}
