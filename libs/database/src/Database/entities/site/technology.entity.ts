// libs/shared/database/src/Database/entities/site/technology.entity.ts

import { Entity, Property, ManyToOne, BeforeCreate, BeforeUpdate } from '@mikro-orm/core';
import slugify from 'slugify';
import { BaseEntity } from '../base.entity';
import { UserProfile } from '../user/user-profile.entity';
import { TechCategory } from '../../enums';

/**
 * A technology is a tool, framework, programming language,
 * or other software used to develop a microservice.
 *
 * This includes but is not limited to:
 * - Programming Languages
 * - Frameworks
 * - Libraries
 * - Databases
 * - Operating Systems
 * - Cloud Providers
 * - etc.
 */
@Entity({ tableName: 'technologies' })
export class Technology extends BaseEntity {
  /**
   * Name of the technology.
   */
  @Property({ type: 'text', name: 'name' })
  name!: string;

  /**
   * Short description of the technology.
   */
  @Property({ type: 'text', name: 'description' })
  description!: string;

  /**
   * Detailed content or documentation for the technology.
   */
  @Property({ type: 'text', name: 'content' })
  content!: string;

  /**
   * URL or path to an image representing the technology.
   */
  @Property({ type: 'text', name: 'image_url' })
  imageUrl!: string;

  /**
   * Alternate text for the image.
   */
  @Property({ type: 'text', name: 'alt_text' })
  altText!: string;

  /**
   * Primary category of the technology.
   */
  @Property({ type: 'text', default: TechCategory.Other, name: 'category1' })
  category1: TechCategory = TechCategory.Other;

  /**
   * Secondary category of the technology.
   */
  @Property({ type: 'text', default: TechCategory.Other, name: 'category2' })
  category2: TechCategory = TechCategory.Other;

  /**
   * Official website or documentation URL.
   */
  @Property({ type: 'text', name: 'website' })
  website!: string;

  /**
   * URL-friendly slug, unique across all technologies.
   */
  @Property({ type: 'text', unique: true, name: 'slug' })
  slug!: string;

  /**
   * Profile of the user who added this technology.
   */
  @ManyToOne(() => UserProfile, { name: 'added_by' })
  addedBy!: UserProfile;

  /**
   * Automatically generate or update slug before insert or update.
   */
  @BeforeCreate()
  @BeforeUpdate()
  generateSlug(): void {
    this.slug = slugify(this.name, { lower: true, replacement: '_' });
  }
}
