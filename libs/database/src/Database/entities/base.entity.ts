import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v5 as uuidv5 } from 'uuidv5'

/**
 * Abstract base entity providing:
 * - UUID v5 primary key (name-based) under the URL namespace
 * - Creation and update timestamps
 * - Optional soft-delete timestamp
 *
 * Extend this class in your entities to inherit these common fields.
 */
@Entity({ abstract: true })
export abstract class BaseEntity {
  /**
   * Primary key: UUID v5, generated using a combination of
   * the current timestamp and random data under the URL namespace.
   */
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv5(`${Date.now()}-${Math.random()}`, uuidv5.URL)

  /**
   * Timestamp when the entity was created.
   * Automatically set on insert.
   */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()

  /**
   * Timestamp when the entity was last updated.
   * Automatically set on insert and update.
   */
  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  /**
   * Timestamp indicating when the entity was soft-deleted.
   * Remains undefined until soft-delete is performed.
   */
  @Property({ nullable: true })
  deletedAt?: Date
}
