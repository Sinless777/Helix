// libs/db/src/entities/abac/policy.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  Unique,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';

/**
 * ABAC Policy
 *
 * Versioned, org-scoped policy documents (CEL/Rego-like rules).
 * One logical policy `code` can have multiple versions.
 *
 * Table: abac_policy
 */
@Entity({ tableName: 'abac_policy' })
@Index({ name: 'idx_policy_org', properties: ['org'] })
@Index({ name: 'idx_policy_code', properties: ['code'] })
@Unique({ name: 'uq_policy_org_code_version', properties: ['org', 'code', 'version'] })
export class Policy extends BaseEntity {
  /** Tenant scope. */
  @ManyToOne(() => Org, { inversedBy: 'policies', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** Short identifier for this policy (e.g., "tickets.write", "billing.view"). */
  @Property({ type: 'text' })
  code!: string;

  /**
   * Rule set (CEL/Rego-like).
   * Store as JSONB for flexibility and partial indexing if needed.
   */
  @Property({ type: 'jsonb' })
  rules!: unknown;

  /** Monotonic version for the given {org, code}. */
  @Property({ type: 'int' })
  version!: number;

  /** Whether this version is active. Multiple versions can exist, but typically one enabled. */
  @Property({ type: 'boolean', default: true })
  enabled = true;
}
