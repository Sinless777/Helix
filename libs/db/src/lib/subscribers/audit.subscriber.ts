import {
  EventSubscriber,
  FlushEventArgs,
  ChangeSetType,
  ChangeSet,
} from '@mikro-orm/core';
import { AsyncLocalStorage } from 'node:async_hooks';

// ── audit context (actor/IP/UA) ───────────────────────────────────────────────
export type AuditContext = {
  actorUserId?: string;
  ip?: string;
  ua?: string;
  requestId?: string;
};

const auditALS = new AsyncLocalStorage<AuditContext>();
export function withAuditContext<T>(ctx: AuditContext, fn: () => T): T {
  return auditALS.run(ctx, fn);
}
export function getAuditContext(): AuditContext {
  return auditALS.getStore() ?? {};
}

// ── expected AuditLog shape (adapt to your entity) ────────────────────────────
type AuditAction = 'create' | 'update' | 'delete';
interface AuditLogLike {
  id?: string;
  actorUserId?: string | null;
  entityName: string;
  entityId: string | null;
  action: AuditAction;
  diff?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
  createdAt?: Date;
}

const AUDIT_ENTITY_NAME = 'AuditLog';
const EXCLUDED_ENTITIES = new Set<string>([AUDIT_ENTITY_NAME]);
type AuditMeta = { ip?: string; ua?: string; requestId?: string };

export class AuditSubscriber implements EventSubscriber<object> {
  getSubscribedEntities() {
    return []; // all entities (flush events are entity-agnostic)
  }

  async onFlush(args: FlushEventArgs): Promise<void> {
    if (process.env.DB_AUDIT_ENABLED === 'false') return;

    const { em, uow } = args;
    const changeSets = uow.getChangeSets();
    if (changeSets.length === 0) return;

    const ctx = getAuditContext();

    for (const cs of changeSets) {
      if (EXCLUDED_ENTITIES.has(cs.name)) continue;

      const action = this.mapAction(cs.type);
      if (!action) continue;

      const { before, after } = this.computeBeforeAfter(cs);
      const pk = cs.getPrimaryKey?.(true) ?? null; // serialized PK if available

      const audit: AuditLogLike = {
        entityName: cs.name,
        entityId: (typeof pk === 'string' ? pk : pk?.toString?.()) ?? null,
        action,
        diff: this.buildDiffPayload(before, after),
        meta: this.buildMeta(ctx),
        actorUserId: ctx.actorUserId ?? null,
        createdAt: new Date(),
      };

      // Create audit row and attach to current UoW (same tx)
      const auditEntity = em.create<AuditLogLike>(AUDIT_ENTITY_NAME as any, audit);
      uow.computeChangeSet(auditEntity);
    }
  }

  private mapAction(type: ChangeSetType): AuditAction | null {
    switch (type) {
      case ChangeSetType.CREATE: return 'create';
      case ChangeSetType.UPDATE: return 'update';
      case ChangeSetType.DELETE: return 'delete';
      default: return null;
    }
  }

  private computeBeforeAfter<T extends object>(cs: ChangeSet<T>) {
    const after: Record<string, unknown> | null =
      cs.type === ChangeSetType.DELETE ? null : sanitizeSerializable(cs.payload ?? {});
    let before: Record<string, unknown> | null = null;

    if (cs.type === ChangeSetType.UPDATE && cs.originalEntity) {
      const oe = cs.originalEntity as Record<string, unknown>;
      before = {};
      for (const k of Object.keys(cs.payload ?? {})) {
        (before as any)[k] = sanitizeScalar((oe as any)[k]);
      }
    } else if (cs.type === ChangeSetType.DELETE) {
      const e = cs.entity as Record<string, unknown>;
      before = {};
      for (const [k, v] of Object.entries(e)) {
        (before as any)[k] = sanitizeScalar(v);
      }
      before = sanitizeSerializable(before);
    }

    return { before, after };
  }

  private buildDiffPayload(
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null,
  ) {
    return before === null && after === null ? null : { before, after };
  }

  private buildMeta(ctx: AuditContext): AuditMeta | null {
    const meta: AuditMeta = {};
    if (ctx.ip) meta.ip = ctx.ip;
    if (ctx.ua) meta.ua = ctx.ua;
    if (ctx.requestId) meta.requestId = ctx.requestId;
    return Object.keys(meta).length ? meta : null;
  }
}

// ── serialization helpers ─────────────────────────────────────────────────────
function sanitizeScalar(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (Array.isArray(value)) return value.map(sanitizeScalar);

  if (value && typeof value === 'object') {
    const maybeId =
      (value as any).id ??
      (value as any).uuid ??
      (value as any).pk ??
      (value as any).id?.toString?.();
    if (maybeId != null && (typeof maybeId === 'string' || typeof maybeId === 'number')) {
      return { id: maybeId };
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as any)) {
      const sv = sanitizeScalar(v);
      if (sv === undefined || typeof sv === 'object') continue;
      out[k] = sv;
    }
    return out;
  }
  return value;
}

function sanitizeSerializable(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const sv = sanitizeScalar(v);
    if (sv !== undefined) out[k] = sv;
  }
  return out;
}
