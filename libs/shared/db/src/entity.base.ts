// libs/db/src/entity.base.ts
import {
  PrimaryKey,
  Property,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { v5 as uuidv5 } from 'uuid';
import { uuidNamespace } from '@helix-ai/core';

/**
 * A namespace UUID for deterministic id generation.
 * Sourced from @helix-ai/core to avoid cross-lib deps.
 */
export const HELIX_UUID_NAMESPACE = uuidNamespace || '00000000-0000-0000-0000-000000000000';

export abstract class BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  @Property({
    type: 'datetime',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();

  /** Generate a deterministic UUIDv5 before insert if none is set. */
  @BeforeCreate()
  protected generateId(): void {
    if (!this.id) {
      const base = `${this.constructor.name}:${Date.now()}:${Math.random()}`;
      this.id = uuidv5(base, HELIX_UUID_NAMESPACE);
    }
  }

  /** Automatically refresh updatedAt before updates. */
  @BeforeUpdate()
  protected touchUpdatedAt(): void {
    this.updatedAt = new Date();
  }
}
