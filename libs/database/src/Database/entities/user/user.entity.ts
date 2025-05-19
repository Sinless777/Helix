import {
  Entity,
  Property,
  OneToOne,
  OneToMany,
  Cascade,
  BeforeCreate,
} from '@mikro-orm/core'
import { v5 as uuidv5 } from 'uuidv5'
import { BaseEntity } from '../base.entity'
import { UserProfile } from './user-profile.entity'
import { UserSetting } from './user-setting.entity'
import { Session } from './session.entity'
import { Account } from './account.entity'
import { Role } from '../../enums'

/**
 * Core User entity storing authentication credentials and relations.
 *
 * Inherits a UUID id, timestamps, and soft-delete from BaseEntity.
 * Generates a new UUID v5 on creation.
 */
@Entity({ tableName: 'users' })
export class User extends BaseEntity {
  /**
   * Primary login email (unique).
   */
  @Property({ type: 'text', unique: true })
  email!: string

  /**
   * Hashed password for authentication.
   */
  @Property({ type: 'text' })
  password!: string

  /**
   * Optional display name.
   */
  @Property({ type: 'text', nullable: true })
  name?: string

  /**
   * Unique username handle.
   */
  @Property({ type: 'text', nullable: true, unique: true, name: 'username' })
  username?: string

  /**
   * URL to the user's avatar image.
   */
  @Property({ type: 'text', nullable: true })
  image?: string

  /**
   * Timestamp when the user's email was verified.
   */
  @Property({ type: 'timestamptz', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt?: Date

  /**
   * Role of the user (enum).
   */
  @Property({ type: 'string', default: Role.User })
  role: Role = Role.User

  /**
   * One-to-one relation to the user's profile.
   */
  @OneToOne(() => UserProfile, {
    cascade: [Cascade.ALL],
    eager: true,
    owner: true,
    name: 'user_profile_id',
  })
  profile!: UserProfile

  /**
   * One-to-one relation to the user's settings.
   */
  @OneToOne(() => UserSetting, {
    cascade: [Cascade.ALL],
    eager: true,
    owner: true,
    name: 'user_setting_id',
  })
  settings!: UserSetting

  /**
   * Sessions associated with this user.
   */
  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[] = []

  /**
   * OAuth accounts linked to this user.
   */
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[] = []

  /**
   * Generate a new UUID v5 for the primary key on creation.
   */
  @BeforeCreate()
  protected setUuid(): void {
    this.id = uuidv5(`${Date.now()}-${Math.random()}`, uuidv5.URL)
  }
}
