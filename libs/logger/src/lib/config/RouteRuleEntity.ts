// libs/logger/src/lib/config/RouteRuleEntity.ts

import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import crypto from 'crypto'

/**
 * MikroORM entity representing an encrypted routing rule.
 * Stores the AES-256-GCM encrypted payload, plus creation and update timestamps.
 */
@Entity({ tableName: 'logger_config' })
export class RouteRuleEntity {
  /**
   * Primary key (UUID) for this rule entry.
   * Automatically generated via Node.js crypto.
   */
  @PrimaryKey()
  public id: string = crypto.randomUUID()

  /**
   * Base64-encoded AES-256-GCM encrypted JSON payload of the RouteRule.
   * Contains IV, auth tag, and ciphertext.
   */
  @Property({ type: 'text' })
  public encryptedPayload!: string

  /**
   * Timestamp when this entry was created.
   * Automatically set on insert.
   */
  @Property({ type: Date, onCreate: () => new Date() })
  public createdAt: Date = new Date()

  /**
   * Timestamp when this entry was last updated.
   * Automatically updated on insert and update.
   */
  @Property({
    type: Date,
    onUpdate: () => new Date(),
    onCreate: () => new Date(),
  })
  public updatedAt: Date = new Date()
}
