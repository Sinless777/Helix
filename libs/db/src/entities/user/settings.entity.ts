// libs/db/src/entities/user/settings.entity.ts

import {
  Entity,
  OneToOne,
  Property,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { User } from './user.entity';

/**
 * UserSettings
 * Owns a 1:1 relationship to User and stores preferences as JSON.
 *
 * Table: user_settings
 */
@Entity({ tableName: 'user_settings' })
export class UserSettings extends BaseEntity {
  /**
   * Owning side of the 1:1 relation.
   * FK lives in this table and is UNIQUE by virtue of OneToOne(owner: true).
   */
  @OneToOne(() => User, (u) => u.settings, {
    owner: true,
    nullable: false,
    unique: true,
  })
  user!: Rel<User>;

  /** Notification preferences (email, push, etc). */
  @Property({ type: 'jsonb', nullable: true })
  notifications?: Record<string, unknown>;

  /** Privacy preferences (discoverability, visibility, etc). */
  @Property({ type: 'jsonb', nullable: true })
  privacy?: Record<string, unknown>;

  /** Accessibility preferences (reduced motion, high contrast, etc). */
  @Property({ type: 'jsonb', nullable: true })
  accessibility?: Record<string, unknown>;

  /** Product/feature toggles or per-user flags. */
  @Property({ type: 'jsonb', nullable: true })
  product?: Record<string, unknown>;
}
