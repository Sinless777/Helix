import { Inject, Injectable, Optional, Scope } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'

import {
  AUDIT_CONTEXT,
  AUDIT_MODULE_OPTIONS,
  AUDIT_ENABLED_DEFAULT,
  REDACT_REPLACEMENT,
  MAX_DIFF_BYTES,
} from './constants'
import type {
  AuditAction,
  AuditContext,
  AuditResource,
  AuditWriteOptions,
} from './types/audit.types'
import { makeAuditDiff } from './utils/diff.util'
import { redact as defaultRedact } from './utils/redact.util'

// Import your entity & the enum as VALUES (not just types)
import {
  AuditLog,
  AuditAction as DBAuditAction,
} from '../../../db/src/lib/entities/audit-log.entity'

export interface WriteParams {
  /** High-level action label (e.g., "auth.login.success"). Goes into meta. */
  action: AuditAction

  /** Target resource; maps to AuditLog.entityName/entityId. */
  resource?: AuditResource

  /** Outcome & severity are stored in `meta` for the slim schema. */
  outcome?: 'success' | 'failure' | 'neutral'
  severity?: 'info' | 'warning' | 'error' | 'critical'

  /** Optional descriptive message & tags (stored in `meta`). */
  message?: string | null
  tags?: string[] | null

  /** Optional explicit timestamp; will be stored as createdAt. */
  timestamp?: Date

  /** Optional before/after snapshots for change recording. */
  before?: unknown
  after?: unknown

  /** Force DB-level action if you don’t want auto-infer. */
  dbAction?: DBAuditAction

  /** Per-call overrides for write options (redaction, size caps, etc.). */
  options?: AuditWriteOptions

  /** Additional custom metadata (merged into `meta`). */
  metadata?: Record<string, unknown> | null
}

/**
 * Request-scoped service that writes normalized audit events compatible with the
 * slim AuditLog entity (actorUserId, entityName, entityId, action, diff, meta).
 */
@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  constructor(
    private readonly em: EntityManager,
    @Optional() @Inject(AUDIT_CONTEXT) private readonly context?: AuditContext,
    @Optional()
    @Inject(AUDIT_MODULE_OPTIONS)
    private readonly moduleOpts?: {
      enabled?: boolean
      redactKeys?: ReadonlyArray<string>
      redactQueryParams?: ReadonlyArray<string>
      redactReplacement?: string
      includeRequestBody?: boolean
      includeResponseBody?: boolean
      maxDiffBytes?: number
    }
  ) {}

  /** Core writer: builds an AuditLog row and persists it. */
  async write(params: WriteParams): Promise<void> {
    const enabled = this.moduleOpts?.enabled ?? AUDIT_ENABLED_DEFAULT
    if (!enabled) return

    const createdAt = params.timestamp ?? new Date()

    // Resolve redaction & diff options (module defaults → call overrides)
    const redactKeys =
      params.options?.redactKeys ?? this.moduleOpts?.redactKeys ?? []
    const replacement =
      params.options?.redactReplacement ??
      this.moduleOpts?.redactReplacement ??
      REDACT_REPLACEMENT
    const maxDiffBytes =
      params.options?.maxDiffBytes ??
      this.moduleOpts?.maxDiffBytes ??
      MAX_DIFF_BYTES

    const computed =
      params.before !== undefined || params.after !== undefined
        ? makeAuditDiff(params.before, params.after, {
            redactKeys,
            redact: defaultRedact,
            maxBytes: maxDiffBytes,
            replacement,
            computePatch: true,
          })
        : undefined

    // Map the richer diff object to the slim DB shape (before/after only)
    const dbDiff: {
      before: Record<string, unknown> | null
      after: Record<string, unknown> | null
    } | null = computed
      ? {
          before: (computed.before as Record<string, unknown>) ?? null,
          after: (computed.after as Record<string, unknown>) ?? null,
        }
      : null

    const ctx = this.context ?? {}

    // Determine DB-level action (create|update|delete)
    const dbAction: DBAuditAction =
      params.dbAction ?? inferDbAction(params.before, params.after)

    // Resource mapping (fallback to "General" if omitted)
    const entityName = params.resource?.type ?? 'General'
    const entityId =
      params.resource?.id != null ? String(params.resource.id) : null

    // Compose slim meta (network, actor context, high-level action, outcome, etc.)
    const meta: Record<string, unknown> = {
      // high-level labels
      action: params.action,
      outcome: params.outcome ?? 'neutral',
      severity: params.severity ?? 'info',
      message: params.message ?? null,
      tags: params.tags ?? null,

      // request/network
      ip: ctx.ip ?? null,
      ua: ctx.userAgent ?? null,
      requestId: ctx.requestId ?? null,

      // extra actor/session hints (not modeled as cols in slim schema)
      orgId: ctx.orgId ?? null,
      teamId: ctx.teamId ?? null,
      sessionId: ctx.sessionId ?? null,
      apiKeyId: ctx.apiKeyId ?? null,

      // geo (if any)
      geo: ctx.geo ?? null,

      // custom metadata
      ...(params.metadata ?? {}),
    }

    const row = this.em.create(AuditLog, {
      createdAt, // explicit timestamp (optional; entity provides default otherwise)
      action: dbAction,
      actorUserId: ctx.userId ?? null,
      entityName,
      entityId,
      diff: dbDiff,
      meta,
    })

    await this.em.persistAndFlush(row)
  }

  // ───────────────────────── Convenience helpers ─────────────────────────

  async success(
    action: AuditAction,
    args: Omit<WriteParams, 'action' | 'outcome'> = {}
  ): Promise<void> {
    return this.write({ ...args, action, outcome: 'success' })
  }

  async failure(
    action: AuditAction,
    message?: string | null,
    args: Omit<WriteParams, 'action' | 'outcome' | 'message'> = {}
  ): Promise<void> {
    return this.write({
      ...args,
      action,
      outcome: 'failure',
      message: message ?? null,
      severity: args.severity ?? 'error',
    })
  }

  async neutral(
    action: AuditAction,
    args: Omit<WriteParams, 'action' | 'outcome'> = {}
  ): Promise<void> {
    return this.write({ ...args, action, outcome: 'neutral' })
  }

  /** Shortcut for CRUD-style changes with before/after. */
  async changed(
    action: AuditAction,
    resource: AuditResource | undefined,
    before: unknown,
    after: unknown,
    args: Omit<WriteParams, 'action' | 'resource' | 'before' | 'after'> = {}
  ): Promise<void> {
    return this.write({ ...args, action, resource, before, after })
  }

  /** Build a resource object quickly. */
  resource(
    type: string,
    id?: string | number | null,
    display?: string | null
  ): AuditResource {
    return { type, id: id ?? undefined, display: display ?? undefined }
  }
}

// ───────────────────────────── internals ─────────────────────────────

function inferDbAction(before: unknown, after: unknown): DBAuditAction {
  if (before === undefined && after === undefined) return DBAuditAction.update
  if (before == null && after != null) return DBAuditAction.create
  if (before != null && after == null) return DBAuditAction.delete
  return DBAuditAction.update
}
