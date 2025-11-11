// libs/db/src/entities/settings/org-settings.entity.ts

import {
  Entity,
  OneToOne,
  Property,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';

/**
 * 🔹 OrgSettings
 *
 * Represents organization-wide configuration, branding, and policy preferences.
 *
 * Each organization has exactly one OrgSettings record, defining:
 * - Branding (logos, colors, theme)
 * - Security policies (MFA, API restrictions, member roles)
 * - Default workspace and billing behavior
 *
 * Table: org_settings
 */
@Entity({ tableName: 'org_settings' })
@Index({ name: 'idx_org_settings_org', properties: ['org'] })
export class OrgSettings extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationship
  // ---------------------------------------------------------------------

  /** Each organization has exactly one settings record. */
  @OneToOne(() => Org, (o) => o.settings, {
    owner: true,
    nullable: false,
    unique: true,
  })
  org!: Rel<Org>;

  // ---------------------------------------------------------------------
  // Configuration Fields
  // ---------------------------------------------------------------------

  /** Organization branding: logo URLs, color themes, etc. */
  @Property({ type: 'jsonb', nullable: true })
  branding?: Record<string, unknown>;

  /** Security-related preferences: MFA policy, IP allowlists, etc. */
  @Property({ type: 'jsonb', nullable: true })
  security?: Record<string, unknown>;

  /** Default org-wide options: timezones, locales, project defaults, etc. */
  @Property({ type: 'jsonb', nullable: true })
  defaults?: Record<string, unknown>;

  /** Billing preferences: default plan, invoice email recipients, etc. */
  @Property({ type: 'jsonb', nullable: true })
  billingPrefs?: Record<string, unknown>;
}
