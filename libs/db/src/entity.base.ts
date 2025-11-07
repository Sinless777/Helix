// libs/db/src/entity.base.ts
import {
  PrimaryKey,
  Property,
  BeforeCreate,
  BeforeUpdate,
} from '@mikro-orm/core';
import { v5 as uuidv5 } from 'uuid';
import { appConfig } from '@helix-ai/config';

/**
 * A namespace UUID for deterministic id generation.
 * Ensure `appConfig.security.uuidNamespace` exists in @helix-ai/config.
 */
export const HELIX_UUID_NAMESPACE =
  appConfig.security.uuid_namespace;

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
