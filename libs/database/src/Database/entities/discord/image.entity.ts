// libs/shared/database/src/Database/entities/discord/image.entity.ts

import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../base.entity';

/**
 * Represents an image record in the Discord context.
 *
 * Extends BaseEntity for UUID id, timestamps, and soft-delete.
 */
@Entity({ tableName: 'discord_images' })
export class Image extends BaseEntity {
  /**
   * Original filename of the image.
   */
  @Property({ type: 'text', name: 'file_name' })
  fileName!: string;

  /**
   * Base directory or path where the image is stored (optional).
   */
  @Property({ type: 'text', nullable: true, name: 'base_path' })
  basePath?: string;

  /**
   * Public URL of the image.
   */
  @Property({ type: 'text', name: 'url' })
  url!: string;

  /**
   * File size in bytes.
   */
  @Property({ type: 'int', name: 'size' })
  size!: number;

  /**
   * Tags associated with the image (stored as a simple array).
   */
  @Property({ type: 'simple-array', name: 'tags' })
  tags!: string[];

  /**
   * Content hash of the image for deduplication.
   */
  @Property({ type: 'text', name: 'hash' })
  hash!: string;

  /**
   * Deletion hash provided by the hosting service, if applicable.
   */
  @Property({ type: 'text', name: 'delete_hash' })
  deleteHash!: string;
}
