// libs/logger/src/lib/config/RouteRuleEntity.ts

import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import crypto from 'crypto'

/**
 * @class RouteRuleEntity
 * @description
 * MikroORM entity representing an encrypted routing rule in the database.
 * Stores the AES-256-GCM encrypted payload of a {@link RouteRule}, along with
 * timestamps for creation and last update.
 */
@Entity({ tableName: 'logger_config' })
export class RouteRuleEntity {
  /**
   * @property {string} id
   * @description
   * Primary key (UUID) for the rule entry. Automatically generated via Node.js crypto.
   */
  @PrimaryKey()
  public id: string = crypto.randomUUID()

  /**
   * @property {string} encryptedPayload
   * @description
   * Base64-encoded AES-256-GCM encrypted JSON payload of the {@link RouteRule}.
   * This field holds the ciphertext, IV, and auth tag.
   */
  @Property({ type: 'text' })
  public encryptedPayload!: string

  /**
   * @property {Date} createdAt
   * @description
   * Timestamp when this entry was first persisted. Automatically set on create.
   */
  @Property({ type: Date, onCreate: () => new Date() })
  public createdAt: Date = new Date()

  /**
   * @property {Date} updatedAt
   * @description
   * Timestamp when this entry was last updated. Automatically set on update and create.
   */
  @Property({
    type: Date,
    onUpdate: () => new Date(),
    onCreate: () => new Date(),
  })
  public updatedAt: Date = new Date()
}
