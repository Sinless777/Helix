// libs/db/src/entities/user/session.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { User } from './user.entity';

/**
 * UserSession
 *
 * Represents an active authentication or API session for a {@link User}.
 * Each session contains a secure token and an expiration timestamp.
 *
 * Table: user_session
 */
@Entity({ tableName: 'user_session' })
@Index({ name: 'idx_session_token', properties: ['sessionToken'] })
@Index({ name: 'idx_session_user_expires', properties: ['user', 'expires'] })
export class UserSession extends BaseEntity {
  /** Secure token identifying this session. */
  @Property({ type: 'text' })
  sessionToken!: string;

  /** Expiration time for this session. */
  @Property({ type: 'datetime' })
  expires!: Date;

  /** Owning user — each session belongs to exactly one user. */
  @ManyToOne(() => User, { inversedBy: 'sessions', fieldName: 'user_id', nullable: false })
  user!: Rel<User>;
}
