// libs/db/src/entities/edge/agent.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';

/**
 * 🔹 Agent
 *
 * Represents an edge, worker, or on-premise Helix node agent
 * registered to an organization.
 *
 * Each agent reports its capabilities, version, and online status.
 *
 * Table: edge_agent
 */
@Entity({ tableName: 'edge_agent' })
@Index({ name: 'idx_agent_org_status', properties: ['org', 'status'] })
@Index({ name: 'idx_agent_last_seen', properties: ['lastSeenAt'] })
export class Agent extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------

  /** Owning organization for this agent. */
  @ManyToOne(() => Org, { inversedBy: 'agents', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  // ---------------------------------------------------------------------
  // Identification & Versioning
  // ---------------------------------------------------------------------

  /**
   * Type of agent — e.g., "worker", "edge", "onprem-node".
   */
  @Property({ type: 'text' })
  kind!: 'worker' | 'edge' | 'onprem-node';

  /**
   * Current software version of the agent.
   * Example: `"1.3.5"` or `"2025.11.05-edge"`.
   */
  @Property({ type: 'text' })
  version!: string;

  // ---------------------------------------------------------------------
  // Operational State
  // ---------------------------------------------------------------------

  /**
   * Status of the agent.
   * Example values:
   * - `"online"`
   * - `"offline"`
   * - `"updating"`
   * - `"error"`
   */
  @Property({ type: 'text', default: 'offline' })
  status = 'offline';

  /**
   * Timestamp when the agent last checked in with Helix Cloud.
   */
  @Property({ type: 'datetime', nullable: true })
  lastSeenAt?: Date;

  /**
   * JSON capabilities object, describing supported tasks, hardware, or modules.
   *
   * Example:
   * ```json
   * {
   *   "cpu": "12-core Xeon",
   *   "gpu": "RTX 3090",
   *   "memoryGB": 64,
   *   "supportedSkills": ["ai.chat", "security.scan"]
   * }
   * ```
   */
  @Property({ type: 'jsonb', nullable: true })
  capabilities?: Record<string, unknown>;

  /**
   * Optional configuration or agent-specific metadata.
   * Can include runtime flags, host info, and network bindings.
   */
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
