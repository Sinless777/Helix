// libs/db/src/entities/user/profile.entity.ts

import {
  Entity,
  OneToOne,
  Property,
  Index,
  Unique,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { User } from './user.entity';

/**
 * UserProfile
 * Owns a 1:1 relationship to User and stores public profile data.
 *
 * Table: user_profile
 */
@Entity({ tableName: 'user_profile' })
@Unique({ name: 'uq_user_profile_user', properties: ['user'] })
@Unique({ name: 'uq_user_profile_handle', properties: ['handle'] })
@Index({ name: 'idx_user_profile_handle', properties: ['handle'] })
export class UserProfile extends BaseEntity {
  /**
   * Owning side of the 1:1 relation.
   * FK lives in this table and is UNIQUE via the decorator above.
   */
  @OneToOne(() => User, (u) => u.profile, {
    owner: true,
    nullable: false,
    unique: true,
  })
  user!: Rel<User>;

  /** Public handle/alias (unique). */
  @Property({ type: 'text' })
  handle!: string;

  /** Optional avatar URL. */
  @Property({ type: 'text', nullable: true })
  avatarUrl?: string;

  /** Optional short bio/description. */
  @Property({ type: 'text', nullable: true })
  bio?: string;

  /** External links (e.g., { github, discord, website }). */
  @Property({ type: 'jsonb', nullable: true })
  links?: Record<string, unknown>;
}
