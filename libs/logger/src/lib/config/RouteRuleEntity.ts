import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import crypto from 'crypto'

/**
 * MikroORM entity to store encrypted routing rules for the logger.
 */
@Entity({ tableName: 'logger_config' })
export class RouteRuleEntity {
  /**
   * Primary key (UUID) for the rule entry.
   */
  @PrimaryKey()
  id: string = crypto.randomUUID()

  /**
   * Base64-encoded AES-256-GCM encrypted payload of the RouteRule.
   */
  @Property({ type: 'text' })
  encryptedPayload!: string

  /**
   * Timestamp when this entry was created.
   */
  @Property({ type: Date, onCreate: () => new Date() })
  createdAt: Date = new Date()

  /**
   * Timestamp when this entry was last updated.
   */
  @Property({
    type: Date,
    onUpdate: () => new Date(),
    onCreate: () => new Date(),
  })
  updatedAt: Date = new Date()
}
