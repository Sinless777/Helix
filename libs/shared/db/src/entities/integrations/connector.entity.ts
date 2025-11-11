// libs/db/src/entities/integrations/connector.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  Cascade,
  Collection,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';
import { ConnectorSecret } from './connector-secret.entity';

/**
 * 🔹 Connector
 *
 * Represents a configured integration instance for an organization.
 * Each connector defines configuration data and connection status
 * for external services such as Slack, GitHub, Notion, etc.
 *
 * Table: integrations_connector
 */
@Entity({ tableName: 'integrations_connector' })
@Index({ name: 'idx_connector_org_code', properties: ['org', 'code'] })
export class Connector extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------

  /** Owning organization for this connector. */
  @ManyToOne(() => Org, { inversedBy: 'connectors', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** Associated secrets for secure credentials storage. */
  @OneToMany(() => ConnectorSecret, (secret) => secret.connector, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
  })
  secrets = new Collection<Rel<ConnectorSecret>>(this);

  // ---------------------------------------------------------------------
  // Connector Details
  // ---------------------------------------------------------------------

  /**
   * Unique integration code.
   * Example: "slack", "github", "discord", "google-calendar".
   */
  @Property({ type: 'text' })
  code!: string;

  /**
   * JSON configuration object for this connector instance.
   * May include OAuth tokens, URLs, or custom parameters.
   */
  @Property({ type: 'jsonb', nullable: true })
  config?: Record<string, unknown>;

  /**
   * Operational status of this connector.
   * Possible values:
   * - "active"
   * - "inactive"
   * - "error"
   * - "pending"
   */
  @Property({ type: 'text', default: 'inactive' })
  status = 'inactive';
}
