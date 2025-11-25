// libs/db/src/entities/user/account.entity.ts

import {
  Entity,
  Property,
  Index,
  ManyToOne,
  LoadStrategy,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { User } from './user.entity';

/**
 * UserAccount
 *
 * Represents an external authentication or integration account
 * linked to a {@link User}.
 *
 * Examples: Google, GitHub, Discord OAuth accounts.
 *
 * Table: user_account
 */
@Entity({ tableName: 'user_account' })
@Index({ name: 'idx_account_user', properties: ['user'] })
@Index({ name: 'idx_account_provider', properties: ['provider', 'accountId'] })
export class UserAccount extends BaseEntity {
  /**
   * Foreign key reference to the owning {@link User}.
   * Each account must belong to exactly one user.
   */
  @ManyToOne(() => User, {
    fieldName: 'user_id',
    nullable: false,
    strategy: LoadStrategy.JOINED,
  })
  user!: Rel<User>;

  /** External provider name (e.g., "google", "github", "discord"). */
  @Property({ type: 'text' })
  provider!: string;

  /** Identifier of the account within the provider’s system. */
  @Property({ type: 'text' })
  accountId!: string;

  /** Display name of the linked account (e.g., "John Doe (Google)"). */
  @Property({ type: 'text' })
  displayName!: string;

  /** Optional management or settings URL for the provider account. */
  @Property({ type: 'text', nullable: true })
  managementUrl?: string;

  /** Connection status ("active", "revoked", "suspended", etc.). */
  @Property({ type: 'text', nullable: true })
  status?: string;

  /** Unix timestamp (ms) when the account was connected. */
  @Property({ type: 'bigint', default: Date.now() })
  connectedAt: number = Date.now();
}
