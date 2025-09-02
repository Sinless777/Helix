// libs/core/src/lib/types/events.ts

/* -----------------------------------------------------------------------------
 * Core scalar brands (kept local to avoid import cycles)
 * ---------------------------------------------------------------------------*/

export type UUID = string & { readonly __brand: 'UUID' }
export type IsoDateTime = string & { readonly __brand: 'IsoDateTime' } // e.g., 2025-10-21T14:12:09.000Z
export type Url = string & { readonly __brand: 'Url' }
export type Semver = string & { readonly __brand: 'Semver' }

export type JsonPrimitive = string | number | boolean | null
export type JsonValue =
  | JsonPrimitive
  | { readonly [k: string]: JsonValue }
  | readonly JsonValue[]
export type JsonObject = { readonly [k: string]: JsonValue }

/* -----------------------------------------------------------------------------
 * Cross-cutting metadata
 * ---------------------------------------------------------------------------*/

export type Environment = 'local' | 'dev' | 'staging' | 'prod'
export type EventPriority = 'low' | 'normal' | 'high' | 'critical'
export type EventBus =
  | 'nats'
  | 'kafka'
  | 'sns'
  | 'rabbitmq'
  | 'gcp-pubsub'
  | 'sqs'
  | 'inproc'

/** Logical topic namespaces used across the platform. */
export type EventTopic =
  | 'auth'
  | 'users'
  | 'teams'
  | 'billing'
  | 'payments'
  | 'discord'
  | 'observability'
  | 'security'
  | 'automation'
  | 'jobs'
  | 'webhooks'
  | 'ai'
  | 'system'

/** Standard actor identity attached to most events. */
export interface Actor {
  readonly type: 'user' | 'service' | 'system' | 'bot'
  /** UUID for user/service where available; may be a stable string for system. */
  readonly id: string
  readonly display_name?: string
  /** For user actors, the org/team context if relevant. */
  readonly tenant_id?: string
}

/** Resource descriptor for audit trails (ARN-ish but generic). */
export interface ResourceRef {
  /** e.g., "team:123", "repo:456", "discord:guild:789" */
  readonly kind: string
  /** Resource identifier in your domain (UUID/string). */
  readonly id: string
  /** Optional path or sub-resource (e.g., "settings/general"). */
  readonly path?: string
  /** Human-friendly label for UI. */
  readonly label?: string
}

/* -----------------------------------------------------------------------------
 * Base event interfaces
 * ---------------------------------------------------------------------------*/

export interface EventBase {
  /** Unique event id generated at the source. */
  readonly id: UUID
  /** RFC3339/ISO timestamp when the event occurred. */
  readonly ts: IsoDateTime
  /** Environment tag to aid routing/segregation. */
  readonly env: Environment
  /** Logical topic/stream this event belongs to. */
  readonly topic: EventTopic
  /** Optional correlation id to stitch multi-service flows. */
  readonly correlation_id?: UUID | string
  /** Optional tracing id/span id if available. */
  readonly trace_id?: string
  /** Event origin service/component (package name, service id, etc.). */
  readonly source: string
  /** Free-form categorization tags for search/analytics. */
  readonly tags?: readonly string[]
  /** The initiator (user/service/bot/system). */
  readonly actor?: Actor
}

/** Discriminated union tag for top-level classification. */
export type EventKind = 'domain' | 'audit' | 'telemetry' | 'webhook' | 'bus'

/* -----------------------------------------------------------------------------
 * Domain events (business state changes)
 * ---------------------------------------------------------------------------*/

export interface DomainEvent<
  Name extends string = string,
  Payload extends JsonObject = JsonObject
> extends EventBase {
  readonly kind: 'domain'
  /** Business-specific name, e.g., "user.created" */
  readonly name: Name
  /** Opaque payload with strong typing at call-sites via generics. */
  readonly payload: Payload
  /** Optional aggregate id and version for event-sourced services. */
  readonly aggregate?: { readonly id: string; readonly version?: number }
}

/* -----------------------------------------------------------------------------
 * Audit events (who did what to which resource)
 * ---------------------------------------------------------------------------*/

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'impersonate'
  | 'authorize'
  | 'permission.grant'
  | 'permission.revoke'
  | 'token.issue'
  | 'token.revoke'
  | 'config.change'
  | 'secret.access'

export interface AuditEvent<Details extends JsonObject = JsonObject>
  extends EventBase {
  readonly kind: 'audit'
  /** Hierarchical action identifier (see AuditAction). */
  readonly action: AuditAction | `${string}.${string}`
  /** Resource acted upon. */
  readonly resource: ResourceRef
  /** Before/after deltas or structured details (mask secrets upstream). */
  readonly details?: Details
  /** Whether action succeeded; attach error codes/messages in details when false. */
  readonly success: boolean
}

/* -----------------------------------------------------------------------------
 * Telemetry events (metrics/logs/traces side-channel)
 * ---------------------------------------------------------------------------*/

export type TelemetryMetricType =
  | 'counter'
  | 'gauge'
  | 'histogram'
  | 'summary'
  | 'timer'

export interface TelemetryLabels {
  readonly [key: string]: string | number | boolean
}

export interface TelemetryEvent extends EventBase {
  readonly kind: 'telemetry'
  /** Metric name, e.g., "http_server_requests_seconds". */
  readonly metric: string
  /** Measurement type. */
  readonly metric_type: TelemetryMetricType
  /** Numeric value (or bucketed data for histograms). */
  readonly value: number
  /** Optional unit (e.g., "ms", "bytes"). */
  readonly unit?: string
  /** Key-value labels/dimensions. */
  readonly labels?: TelemetryLabels
  /** Optional sample rate for downsampling. */
  readonly sample_rate?: number
}

/* -----------------------------------------------------------------------------
 * Webhook events (deliveries to external systems)
 * ---------------------------------------------------------------------------*/

export type WebhookStatus =
  | 'queued'
  | 'delivering'
  | 'succeeded'
  | 'failed'
  | 'permanently-failed'

export interface WebhookDeliveryAttempt {
  readonly attempt: number
  readonly ts: IsoDateTime
  readonly status: number // HTTP status code
  readonly duration_ms: number
  readonly error?: string
}

export interface WebhookEvent extends EventBase {
  readonly kind: 'webhook'
  /** Destination endpoint. */
  readonly target: Url
  /** Outgoing HTTP method (usually POST). */
  readonly method: 'POST' | 'PUT' | 'PATCH'
  /** Headers sent to the receiver (values must be safe/scrubbed). */
  readonly headers: Readonly<Record<string, string>>
  /** Payload body (JSON-serializable). */
  readonly body: JsonObject
  /** Signature metadata for verification at the receiver. */
  readonly signature?: {
    readonly algo: 'sha256' | 'ed25519' | 'rsa-pss-sha256'
    readonly key_id?: string
    readonly value: string
  }
  /** Delivery lifecycle. */
  readonly status: WebhookStatus
  readonly attempts: readonly WebhookDeliveryAttempt[]
  /** Next retry time (if queued/retryable). */
  readonly next_retry_at?: IsoDateTime
}

/* -----------------------------------------------------------------------------
 * Bus messages (raw transport envelopes for brokers)
 * ---------------------------------------------------------------------------*/

export interface BusMessage<Payload extends JsonObject = JsonObject>
  extends EventBase {
  readonly kind: 'bus'
  /** Underlying transport used. */
  readonly bus: EventBus
  /** Physical topic/subject/stream. */
  readonly channel: string
  /** Optional partition/shard info (Kafka, etc.). */
  readonly partition?: number
  /** Optional key for ordering semantics. */
  readonly key?: string
  /** Broker headers (string-only for portability). */
  readonly headers?: Readonly<Record<string, string>>
  /** Raw JSON payload. */
  readonly payload: Payload
}

/* -----------------------------------------------------------------------------
 * Unified event union & generic envelope
 * ---------------------------------------------------------------------------*/

export type AppEvent =
  | DomainEvent<string, JsonObject>
  | AuditEvent<JsonObject>
  | TelemetryEvent
  | WebhookEvent
  | BusMessage<JsonObject>

/** Retry policy hint (advisory—actual backoff lives in infra). */
export interface RetryPolicy {
  readonly strategy: 'none' | 'linear' | 'exponential' | 'fixed'
  readonly max_attempts?: number
  /** Milliseconds; meaning depends on strategy. */
  readonly interval_ms?: number
  /** Upper bound for backoff when exponential. */
  readonly max_interval_ms?: number
}

/** Standard envelope for publishing/storing events with versioned schemas. */
export interface EventEnvelope<E extends AppEvent = AppEvent> {
  readonly schema: {
    /** Name of the schema, e.g., "helix.events.v1". */
    readonly name: string
    /** Semver of the envelope schema, not the event name. */
    readonly version: Semver
  }
  readonly meta?: {
    readonly dedupe_key?: string
    readonly priority?: EventPriority
    readonly ttl_seconds?: number
    readonly retry?: RetryPolicy
  }
  /** The actual event. */
  readonly event: E
}

/* -----------------------------------------------------------------------------
 * Common discriminated helpers (narrowing)
 * ---------------------------------------------------------------------------*/

export function isDomainEvent(e: AppEvent): e is DomainEvent {
  return (e as DomainEvent).kind === 'domain'
}

export function isAuditEvent(e: AppEvent): e is AuditEvent {
  return (e as AuditEvent).kind === 'audit'
}

export function isTelemetryEvent(e: AppEvent): e is TelemetryEvent {
  return (e as TelemetryEvent).kind === 'telemetry'
}

export function isWebhookEvent(e: AppEvent): e is WebhookEvent {
  return (e as WebhookEvent).kind === 'webhook'
}

export function isBusMessage(e: AppEvent): e is BusMessage {
  return (e as BusMessage).kind === 'bus'
}

/* -----------------------------------------------------------------------------
 * Example canonical names for domain events (optional, ergonomic)
 * ---------------------------------------------------------------------------*/

export type DomainEventName =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'team.created'
  | 'team.member.added'
  | 'team.member.removed'
  | 'billing.invoice.created'
  | 'billing.invoice.paid'
  | 'discord.guild.connected'
  | 'discord.guild.disconnected'
  | 'webhook.endpoint.created'
  | 'webhook.endpoint.disabled'

/** Convenience alias if you want to strongly type domain names at call sites. */
export type NamedDomainEvent<P extends JsonObject = JsonObject> = DomainEvent<
  DomainEventName,
  P
>
