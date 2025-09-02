// libs/core/src/lib/types/data.ts

/* -----------------------------------------------------------------------------
 * Core Data & DTO Types (framework-agnostic)
 * Everything here is pure TypeScript: no runtime deps, no env assumptions.
 * -------------------------------------------------------------------------- */

/** ---------- Branded primitives ---------- */

/** Opaque UUID string (e.g., "9b7a2a5f-6d61-4eb0-9a4d-8d8a0b7d7e9b"). */
export type UUID = string & { readonly __brand: 'UUID' }

/** Opaque ISO 8601 date string (UTC or offset), e.g., "2025-01-01T12:00:00Z". */
export type IsoDateTime = string & { readonly __brand: 'IsoDateTime' }

/** Opaque ISO 8601 date (date-only) string, e.g., "2025-01-01". */
export type IsoDate = string & { readonly __brand: 'IsoDate' }

/** Discord/Twitter-style numeric snowflake IDs represented as strings. */
export type Snowflake = string & { readonly __brand: 'Snowflake' }

/** Generic, entity-scoped ID brand: ID<'user'>, ID<'team'>, etc. */
export type ID<Scope extends string> = string & {
  readonly __brand: `ID:${Scope}`
}

/** URL brand (not validating here — keep runtime checks in config utils). */
export type Url = string & { readonly __brand: 'Url' }

/** Milliseconds / Seconds numeric brands for clarity. */
export type Milliseconds = number & { readonly __brand: 'Milliseconds' }
export type Seconds = number & { readonly __brand: 'Seconds' }

/** A short human-friendly code (e.g., invite codes, slugs). */
export type Code = string & { readonly __brand: 'Code' }

/** ---------- Common entity mixins ---------- */

export interface Timestamped {
  readonly createdAt: IsoDateTime
  readonly updatedAt: IsoDateTime
}

export interface WithSoftDelete {
  /** If present, the entity is considered soft-deleted. */
  readonly deletedAt?: IsoDateTime
}

export interface WithAudit<UserId extends string = UUID> {
  readonly createdBy?: UserId
  readonly updatedBy?: UserId
  readonly deletedBy?: UserId
}

export interface WithTenant<TenantId extends string = UUID> {
  readonly tenantId: TenantId
}

export interface WithOrg<OrgId extends string = UUID> {
  readonly orgId: OrgId
}

/** Minimal base shape for entities persisted somewhere. */
export interface BaseEntity<Id extends string = UUID> extends Timestamped {
  readonly id: Id
}

/** Example “reference” to another resource without full embedding. */
export interface ResourceRef<Kind extends string, Id extends string = UUID> {
  readonly kind: Kind
  readonly id: Id
  readonly href?: Url
  readonly label?: string
}

/** ---------- Sorting, filtering, pagination ---------- */

/** Sort direction. */
export type SortOrder = 'asc' | 'desc'

/** Sort spec over an arbitrary record type. */
export type SortSpec<TRecord> = Readonly<{
  field: keyof TRecord & string
  order: SortOrder
}>

/** Comparison operators for typed filters. */
export type ComparisonOp =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'icontains'
  | 'startsWith'
  | 'endsWith'
  | 'isNull'

export type FieldFilter<Field extends PropertyKey = string> = Readonly<{
  field: Field & string
  op: ComparisonOp
  value?: unknown
}>

/** Generic query filter: combine multiple field filters with AND/OR. */
export type QueryFilter<Field extends PropertyKey = string> = Readonly<{
  and?: readonly (FieldFilter<Field> | QueryFilter<Field>)[]
  or?: readonly (FieldFilter<Field> | QueryFilter<Field>)[]
}>

/** Offset-based pagination request. */
export interface PageRequest<TRecord = unknown> {
  readonly page: number // 1-based
  readonly pageSize: number // > 0
  readonly sort?: readonly SortSpec<TRecord>[]
  readonly filter?: QueryFilter<keyof TRecord>
}

/** Offset-based pagination response. */
export interface Page<TRecord> {
  readonly items: readonly TRecord[]
  readonly page: number
  readonly pageSize: number
  readonly totalItems: number
  readonly totalPages: number
}

/** Cursor-based pagination request. */
export interface CursorRequest<TRecord = unknown> {
  readonly cursor?: string
  readonly limit: number
  readonly sort?: readonly SortSpec<TRecord>[]
  readonly filter?: QueryFilter<keyof TRecord>
}

/** Cursor-based pagination response. */
export interface CursorPage<TRecord> {
  readonly items: readonly TRecord[]
  readonly nextCursor?: string
  readonly prevCursor?: string
  readonly limit: number
}

/** ---------- API envelopes & errors ---------- */

export interface ApiErrorShape {
  /** Numeric code from your central registry (e.g., KnownErrorCode). */
  readonly code: number
  /** Dotted path name (e.g., "System.discord.API_DOWN") if known. */
  readonly name?: string
  /** Human-readable message (safe for logs/UI). */
  readonly message: string
  /** Optional machine-readable details. */
  readonly details?: Record<string, unknown>
}

/** Canonical API response envelope. */
export type ApiResponse<T> =
  | {
      readonly ok: true
      readonly data: T
      readonly meta?: Record<string, unknown>
    }
  | { readonly ok: false; readonly error: ApiErrorShape }

/** A discriminated ‘Result’ for internal use (service-layer). */
export type Result<T, E = ApiErrorShape> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

/** Convenience constructor helpers (inline, zero runtime deps). */
export const Ok = <T>(value: T): Result<T> => ({ ok: true, value })
export const Err = <T = never, E = ApiErrorShape>(error: E): Result<T, E> => ({
  ok: false,
  error
})

/** ---------- CRUD DTO conventions ---------- */

/** By convention, Create DTOs omit server-managed fields. */
export type CreateDto<T extends object> = Omit<
  T,
  keyof Timestamped | keyof WithSoftDelete | 'id'
>

/** Update DTOs are partials, still omitting server-managed fields. */
export type UpdateDto<T extends object> = Partial<CreateDto<T>>

/** Upsert DTO (use sparingly). */
export type UpsertDto<T extends object> = Partial<T> & { readonly id?: string }

/** ---------- Event & changefeed types (CQRS-friendly) ---------- */

export type DataEventKind = 'created' | 'updated' | 'deleted' | 'restored'

export interface DataEvent<TRecord, Id extends string = UUID> {
  readonly kind: DataEventKind
  readonly id: Id
  readonly at: IsoDateTime
  readonly actorId?: UUID
  /** The resource after change (for created/updated/restored). */
  readonly after?: TRecord
  /** The resource before change (for updated/deleted). */
  readonly before?: Partial<TRecord>
  /** Optional partition/shard key for event streams. */
  readonly partitionKey?: string
  /** Extra metadata for pipelines. */
  readonly meta?: Readonly<Record<string, unknown>>
}

/** ---------- Utility types ---------- */

/** Deeply readonly view (no runtime cost). */
export type ReadonlyDeep<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: ReadonlyDeep<T[K]> }
    : T

/** Recursively optional properties (useful for patch DTOs). */
export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T

/** Picks only keys of T whose values extend V. */
export type KeysOfType<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

/** A normalised mapping result (e.g., bulk-load lookups) */
export interface MapResult<Id extends string = UUID, TRecord = unknown> {
  readonly found: Readonly<Record<Id, TRecord>>
  readonly missing: readonly Id[]
}
