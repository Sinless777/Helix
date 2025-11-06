// libs/db/src/entities/assistant/run-log.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Run } from './run.entity';

/**
 * RunLog
 *
 * Structured logs/emissions captured during a single {@link Run}.
 * Useful for tracing tool I/O, debug info, and telemetry.
 *
 * Table: assistant_run_log
 */
@Entity({ tableName: 'assistant_run_log' })
@Index({ name: 'idx_runlog_run', properties: ['run'] })
@Index({ name: 'idx_runlog_created', properties: ['createdAt'] })
export class RunLog extends BaseEntity {
  /** Parent run this log entry belongs to. */
  @ManyToOne(() => Run, { inversedBy: 'logs', fieldName: 'run_id', nullable: false })
  run!: Rel<Run>;

  /**
   * Arbitrary structured log payload.
   * Examples:
   *  - { level: "info", message: "tool invoked", tool: "web.search", args: {...} }
   *  - { level: "error", message: "timeout", durationMs: 15000 }
   *  - [{ ts, level, msg }, ...]
   */
  @Property({ type: 'jsonb' })
  logs!: unknown;
}
