// libs/db/src/entities/org/org-member.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  Unique,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from './org.entity';
import { User } from '../user/user.entity';

/**
 * OrgMember
 *
 * Represents a user’s membership in an organization.
 * Each record links a {@link User} to an {@link Org}, defining
 * their role, attributes, and metadata within that organization.
 *
 * Table: org_member
 */
@Entity({ tableName: 'org_member' })
@Index({ name: 'idx_org_member_org', properties: ['org'] })
@Index({ name: 'idx_org_member_user', properties: ['user'] })
@Unique({ name: 'uq_org_member_org_user', properties: ['org', 'user'] })
export class OrgMember extends BaseEntity {
  /** The organization this member belongs to. */
  @ManyToOne(() => Org, { inversedBy: 'members', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** The user associated with this membership. */

  @ManyToOne(() => User, { inversedBy: 'orgMemberships', fieldName: 'user_id', nullable: false })
  user!: Rel<User>;
  role!: string;

  /**
   * Optional ABAC attributes for fine-grained access control.
   * Could include department, region, or custom claims.
   *
   * @example
   * ```ts
   * member.attributes = { department: "engineering", level: 3 };
   * ```
   */
  @Property({ type: 'jsonb', nullable: true })
  attributes?: Record<string, unknown>;

  /** Timestamp when this membership was created. */
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP' })
  override createdAt: Date = new Date();
}
