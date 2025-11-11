// libs/db/src/entities/assistant/run.entity.ts

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
import { Conversation } from './conversation.entity';
import { RunLog } from './run-log.entity';

/**
 * 🔹 Run
 *
 * Represents a single AI or automation execution triggered during a conversation.
 * Each Run captures metadata such as execution status, timing, latency, and
 * any logs or telemetry generated during the process.
 *
 * Table: `assistant_run`
 */
@Entity({ tableName: 'assistant_run' })
@Index({ name: 'idx_run_org', properties: ['org'] })
@Index({ name: 'idx_run_conversation', properties: ['conversation'] })
@Index({ name: 'idx_run_status', properties: ['status'] })
export class Run extends BaseEntity {
  // ---------------------------------------------------------------------
  // Relationships
  // ---------------------------------------------------------------------

  /** Organization under which this run was executed (multi-tenant isolation). */
  @ManyToOne(() => Org, {
    fieldName: 'org_id',
    nullable: false,
  })
  org!: Rel<Org>;

  /** Parent conversation that triggered this run. */
  @ManyToOne(() => Conversation, {
    fieldName: 'conversation_id',
    nullable: false,
  })
  conversation!: Rel<Conversation>;

  /** All logs associated with this run (execution trace, stdout, errors, etc.). */
  @OneToMany(() => RunLog, (log) => log.run, { cascade: [Cascade.PERSIST, Cascade.REMOVE] })
  logs = new Collection<Rel<RunLog>>(this);

  // ---------------------------------------------------------------------
  // Execution Metadata
  // ---------------------------------------------------------------------

  /**
   * Identifier for the invoked skill, agent, or tool.
   *
   * Example: `"helix.chat.generate"`, `"summarize.webpage"`.
   */
  @Property({ type: 'text' })
  skillCode!: string;

  /**
   * Current status of the execution.
   * Possible values: `"pending"`, `"running"`, `"success"`, `"error"`, `"cancelled"`.
   */
  @Property({ type: 'text' })
  status!: string;

  /**
   * Execution latency (in milliseconds).
   * Captured automatically when the run completes.
   */
  @Property({ type: 'float', nullable: true })
  latencyMs?: number;

  /** When the run began executing. */
  @Property({ type: 'datetime', nullable: true })
  startedAt?: Date;

  /** When the run finished executing (success or failure). */
  @Property({ type: 'datetime', nullable: true })
  finishedAt?: Date;
}
