// libs/db/src/entities/integrations/connector-secret.entity.ts

import {
  Entity,
  ManyToOne,
  Index,
  Unique,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';
import { Connector } from './connector.entity';
import { Secret } from '../security/secret.entity';

/**
 * ConnectorSecret
 *
 * Joins a Connector to a Secret within an organization.
 * Allows connectors to reference one or more encrypted secrets.
 *
 * Table: integrations_connector_secret
 */
@Entity({ tableName: 'integrations_connector_secret' })
@Index({ name: 'idx_connector_secret_org', properties: ['org'] })
@Index({ name: 'idx_connector_secret_connector', properties: ['connector'] })
@Index({ name: 'idx_connector_secret_secret', properties: ['secret'] })
@Unique({ name: 'uq_connector_secret_pair', properties: ['connector', 'secret'] })
export class ConnectorSecret extends BaseEntity {
  /** Tenant scope. */
  @ManyToOne(() => Org, { inversedBy: 'connectorSecrets', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** Connector that uses the secret. */
  @ManyToOne(() => Connector, { inversedBy: 'secrets', fieldName: 'connector_id', nullable: false })
  connector!: Rel<Connector>;

  /** Secret referenced by the connector. */
  @ManyToOne(() => Secret, {
    fieldName: 'secret_id',
    nullable: false,
  })
  secret!: Rel<Secret>;
}
