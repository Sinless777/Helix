// libs/db/src/entities/system/api-key.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { User } from '../user/user.entity';
import { Org } from '../org/org.entity';

/**
 * ApiKey
 *
 * Represents an API key issued to either a user or an organization.
 * Each key includes its scope(s), hashed secret, and audit timestamps.
 *
 * Table: system_api_key
 */
@Entity({ tableName: 'system_api_key' })
@Index({ name: 'idx_api_key_org', properties: ['org'] })
@Index({ name: 'idx_api_key_user', properties: ['user'] })
@Index({ name: 'idx_api_key_hash', properties: ['hashedSecret'], options: { unique: true } })
export class ApiKey extends BaseEntity {
  /** API key name or label (e.g., "CI/CD Token", "Discord Bot Key"). */
  @Property({ type: 'text' })
  name!: string;

  /** Optional description for context. */
  @Property({ type: 'text', nullable: true })
  description?: string;

  /** Key scopes (space-delimited or JSON array string). */
  @Property({ type: 'text' })
  scopes!: string;

  /** Securely stored hash of the API secret. */
  @Property({ type: 'text' })
  hashedSecret!: string;

  /** Reference to the owning organization, if org-scoped. */
  @ManyToOne(() => Org, { fieldName: 'org_id', nullable: true })
  org?: Rel<Org>;

  /** Reference to the owning user, if user-scoped. */
  @ManyToOne(() => User, { inversedBy: 'apiKeys', fieldName: 'user_id', nullable: true })
  user?: Rel<User>;

  /** Timestamp (ms) when this key was last used. */
  @Property({ type: 'datetime', nullable: true })
  lastUsedAt?: Date;

  /** Timestamp when the key was revoked. Null = active. */
  @Property({ type: 'datetime', nullable: true })
  revokedAt?: Date;

  /** Soft delete marker / revocation reason (optional). */
  @Property({ type: 'text', nullable: true })
  reason?: string;
}
