// libs/shared/database/src/Database/entities/site/microservice.entity.ts

import { Entity, Property, ManyToOne, BeforeCreate, BeforeUpdate } from '@mikro-orm/core';
import slugify from 'slugify';
import { BaseEntity } from '../base.entity';
import { UserProfile } from '../user/user-profile.entity';

/**
 * Represents a microservice entry added by a user.
 *
 * Extends BaseEntity for id, timestamps, and soft-delete.
 * Generates a URL-friendly slug from the name on create/update.
 */
@Entity({ tableName: 'microservices' })
export class Microservice extends BaseEntity {
  /**
   * Display name of the microservice.
   */
  @Property({ type: 'text', name: 'name' })
  name!: string;

  /**
   * Short description of the microservice.
   */
  @Property({ type: 'text', name: 'description' })
  description!: string;

  /**
   * Detailed content or documentation for the microservice.
   */
  @Property({ type: 'text', name: 'content' })
  content!: string;

  /**
   * URL or path to an image representing the microservice.
   */
  @Property({ type: 'text', name: 'image' })
  image!: string;

  /**
   * Alternative text for the image.
   */
  @Property({ type: 'text', name: 'alt' })
  alt!: string;

  /**
   * Reference to the user profile who added this microservice.
   */
  @ManyToOne(() => UserProfile, { name: 'added_by' })
  addedBy!: UserProfile;

  /**
   * URL-friendly slug, unique across microservices.
   */
  @Property({ type: 'text', unique: true, name: 'slug' })
  slug!: string;

  /**
   * Generate or update slug before insert or update operations.
   */
  @BeforeCreate()
  @BeforeUpdate()
  generateSlug(): void {
    this.slug = slugify(this.name, { lower: true, replacement: '_' });
  }
}
