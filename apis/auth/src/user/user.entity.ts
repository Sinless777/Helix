import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
  BeforeCreate,
} from '@mikro-orm/core'
import { v5 as uuidv5 } from 'uuid'

/**
 * Constant namespace UUID used for generating deterministic UUIDv5.
 * Replace this with a secure, project-specific namespace.
 */
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * Represents a User in the authentication system.
 *
 * @example
 * const user = new User()
 * user.email = 'test@example.com'
 * user.generateUuid()
 */
@Entity()
export class User {
  /**
   * Unique identifier for the user.
   * Auto-generated using UUIDv5 based on the email.
   */
  @PrimaryKey()
  id!: string

  /**
   * User's unique email address.
   */
  @Property()
  @Unique()
  email!: string

  /**
   * Hashed password for authentication.
   * Stored as a bcrypt hash. May be null for OAuth-only accounts.
   */
  @Property({ nullable: true })
  passwordHash?: string

  /**
   * Optional display name of the user.
   */
  @Property({ nullable: true })
  name?: string

  /**
   * Optional custom avatar URL.
   */
  @Property({ nullable: true })
  avatarUrl?: string

  /**
   * Optional Gravatar image URL based on the user's email.
   */
  @Property({ nullable: true })
  gravatar?: string

  /**
   * Timestamp when the user was created.
   * Automatically set on entity creation.
   */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()

  /**
   * Timestamp when the user was last updated.
   * Automatically set on entity update.
   */
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  /**
   * Lifecycle hook that generates a deterministic UUIDv5 for the user.
   *
   * @returns {void}
   * @example
   * user.generateUuid()
   */
  @BeforeCreate()
  generateUuid(): void {
    if (!this.id && this.email) {
      this.id = uuidv5(this.email, NAMESPACE)
    }
  }
}
