import { Entity, PrimaryKey, Property, Index, Enum } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

export enum AuditAction {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export interface AuditDiff {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export interface AuditMeta {
  ip?: string;
  ua?: string;
  requestId?: string;
  // allow future fields without schema churn
  [key: string]: unknown;
}

/**
 * Generic audit log row emitted by AuditSubscriber (onFlush).
 * Table intentionally keeps minimal relations (strings/uuids) to avoid cycles.
 */
@Entity({ tableName: 'audit_log' })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['entityName'] })
@Index({ properties: ['actorUserId'] })
export class AuditLog {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Optional actor (user performing the action). */
  @Property({ type: 'uuid', nullable: true })
  actorUserId?: string | null;

  /** Entity class name registered in MikroORM metadata, e.g., "User", "Organization". */
  @Property()
  entityName!: string;

  /**
   * Serialized primary key of the affected entity (usually a UUID string).
   * May be null for bulk operations or cases where PK isn’t available.
   */
  @Property({ nullable: true })
  entityId?: string | null;

  /** Action taken on the entity (create/update/delete). */
  @Enum({ items: () => AuditAction, type: 'string' })
  action!: AuditAction;

  /** JSON diff payload (before/after snapshots). */
  @Property({ type: 'json', nullable: true })
  diff?: AuditDiff | null;

  /** Request metadata (ip/ua/requestId/etc.). */
  @Property({ type: 'json', nullable: true })
  meta?: AuditMeta | null;

  /** When this audit row was written. */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}

/*
Migration notes (Cockroach/Postgres):

-- Optional enum if you want a DB-side type (else keep string):
-- CREATE TYPE audit_action AS ENUM ('create','update','delete');
-- ALTER TABLE audit_log ALTER COLUMN action TYPE audit_action USING action::audit_action;

-- Helpful indexes are already declared via decorators.
-- If you plan to query into diff/meta, consider inverted indexes:
-- CREATE INVERTED INDEX IF NOT EXISTS idx_audit_log_diff ON audit_log (diff);
-- CREATE INVERTED INDEX IF NOT EXISTS idx_audit_log_meta ON audit_log (meta);
*/
