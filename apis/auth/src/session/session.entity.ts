import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  Index,
  BeforeCreate,
} from '@mikro-orm/core'
import { User } from '../user/user.entity'
import { v5 as uuidv5 } from 'uuid'

/**
 * UUID namespace for deterministic session ID generation.
 * Replace with a secure project-specific UUID namespace.
 */
const SESSION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * Represents an authentication session tied to a user.
 * Stores metadata like IP address, user agent, and revocation status.
 */
@Entity()
export class Session {
  /**
   * Unique session ID (UUIDv5).
   * Generated before entity creation.
   */
  @PrimaryKey()
  id!: string

  /**
   * Associated user for the session.
   */
  @ManyToOne(() => User)
  user!: User

  /**
   * IP address of the client.
   */
  @Property()
  ipAddress!: string

  /**
   * Optional geolocation data (country, city).
   */
  @Property({ nullable: true })
  geoLocation?: string

  /**
   * Optional raw geoIP value.
   */
  @Property({ nullable: true })
  geoIP?: string

  /**
   * User agent string from the client (e.g. browser or device info).
   */
  @Property()
  userAgent!: string

  /**
   * Timestamp of session creation.
   * Automatically set when the entity is created.
   */
  @Index()
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()

  /**
   * Timestamp of the last session update.
   * Automatically refreshed on each entity update.
   */
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  /**
   * Optional expiration timestamp for the session.
   */
  @Property({ nullable: true })
  expiresAt?: Date

  /**
   * Indicates whether the session was revoked (e.g. on logout).
   */
  @Property({ default: false })
  revoked: boolean = false

  /**
   * Generates a UUIDv5 based on timestamp + random seed before create.
   */
  @BeforeCreate()
  generateId() {
    this.id = uuidv5(`${Date.now()}-${Math.random()}`, SESSION_NAMESPACE)
  }
}
