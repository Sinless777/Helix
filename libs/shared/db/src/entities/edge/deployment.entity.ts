// libs/db/src/entities/edge/deployment.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';

export type DeploymentEnvironment = 'dev' | 'staging' | 'prod' | 'airgapped';

/**
 * 🔹 Deployment
 *
 * Declarative deployment record for an organization’s Helix footprint.
 * Captures target environment/region and the rendered config used to deploy.
 *
 * Table: edge_deployment
 */
@Entity({ tableName: 'edge_deployment' })
@Index({ name: 'idx_deployment_org', properties: ['org'] })
@Index({ name: 'idx_deployment_env_region', properties: ['environment', 'region'] })
export class Deployment extends BaseEntity {
  /** Tenant scope. */
  @ManyToOne(() => Org, { inversedBy: 'deployments', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** Target environment (dev/staging/prod/airgapped). */
  @Property({ type: 'text' })
  environment!: DeploymentEnvironment;

  /** Cloud/geo region (e.g., "us-west-2", "eu-central-1", "onprem-lab"). */
  @Property({ type: 'text' })
  region!: string;

  /**
   * Deployment configuration payload (rendered spec, params, manifests).
   * Store provider-agnostic data you want to audit/replay.
   */
  @Property({ type: 'jsonb', nullable: true })
  config?: Record<string, unknown>;

  /** Optional status marker for orchestration pipelines. */
  @Property({ type: 'text', nullable: true })
  status?: 'pending' | 'running' | 'succeeded' | 'failed';

  /** Optional metadata (commit SHA, pipeline id, actor, notes). */
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
