// libs/db/src/entities/user/verification-token.entity.ts

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
 * UserVerificationToken
 *
 * Represents a one-time-use token linked to a {@link User} for verification flows:
 * - email confirmation
 * - password reset
 * - multi-factor authentication
 *
 * Table: user_verification_token
 */
@Entity({ tableName: 'user_verification_token' })
@Index({ name: 'idx_verification_identifier_token', properties: ['identifier', 'token'] })
@Index({ name: 'idx_verification_user_expires', properties: ['user', 'expires'] })
export class UserVerificationToken extends BaseEntity {
  /** The logical identifier for this token (usually an email). */
  @Property({ type: 'text' })
  identifier!: string;

  /** Reference to the owning user (FK). */
  @ManyToOne(() => User, { inversedBy: 'verificationTokens', fieldName: 'user_id', nullable: false })
  user!: Rel<User>;

  /** The raw or hashed token value. */
  @Property({ type: 'text' })
  token!: string;

  /** Expiration timestamp after which this token is invalid. */
  @Property({ type: 'datetime' })
  expires!: Date;
}
