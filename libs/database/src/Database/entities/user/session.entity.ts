import { Entity, Property, ManyToOne } from '@mikro-orm/core'
import { User } from './user.entity'
import { BaseEntity } from '../base.entity'

/**
 * Represents a user session.
 *
 * Inherits common fields (id, timestamps, soft-delete) from BaseEntity.
 */
@Entity({ tableName: 'sessions' })
export class Session extends BaseEntity {
  /**
   * Unique token for this session.
   */
  @Property({ type: 'text', name: 'session_token' })
  sessionToken!: string

  /**
   * Expiration time of the session.
   */
  @Property({ type: 'timestamptz', name: 'expires_at', onUpdate: null })
  expiresAt!: Date

  /**
   * Owning user for this session.
   * Column: user_id (UUID)
   */
  @ManyToOne(() => User, { name: 'user_id' })
  user!: User
}
