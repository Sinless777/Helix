// libs/shared/database/src/Database/entities/discord/pastebin.entity.ts

import { Entity, Property, ManyToOne, BeforeCreate  } from '@mikro-orm/core';
import { BaseEntity } from '../base.entity';
import { DiscordUser } from './user.entity';

/**
 * Represents a Pastebin-like paste record in the Discord context.
 *
 * Extends BaseEntity for UUID id, timestamps, and soft-delete.
 */
@Entity({ tableName: 'pastebins' })
export class Pastebin extends BaseEntity {
  /**
   * Edit code used to modify or delete the paste.
   */
  @Property({ type: 'text', name: 'edit_code', unique: true })
  editCode!: string;

  /**
   * Raw text content of the paste.
   */
  @Property({ type: 'text', name: 'content' })
  content!: string;

  /**
   * Lifetime of the paste in seconds. Use -1 for no expiration.
   */
  @Property({ type: 'int', name: 'lifetime', default: -1 })
  lifetime!: number;

  /**
   * Computed expiration timestamp. Null if lifetime is -1.
   */
  @Property({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt?: Date;

  /**
   * Optional owner of the paste.
   */
  @ManyToOne(() => DiscordUser, { nullable: true })
  user?: DiscordUser;

  /**
   * Computes expiresAt on create, based on lifetime.
   */
  @BeforeCreate()
  computeExpiration() {
    if (this.lifetime > 0) {
      this.expiresAt = new Date(Date.now() + this.lifetime * 1000);
    }
  }
}
