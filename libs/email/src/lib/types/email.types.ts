// libs/email/src/lib/types/email.types.ts
// -----------------------------------------------------------------------------
// Core types for the email library. Keep these transport-agnostic so they work
// with SMTP (Nodemailer/Mailpit), API-based providers, or mocks in tests.
// -----------------------------------------------------------------------------

/**
 * A single email address in flexible form:
 *  - "Jane <jane@example.com>" (string)
 *  - { name: "Jane", address: "jane@example.com" } (object)
 *
 * Use `NormalizedAddress` if you need a guaranteed object shape.
 */
export type Address = string | { name?: string | null; address: string }

/** A field that accepts one or many addresses. */
export type AddressField = Address | Address[]

/** Canonical object form produced by utils (e.g., address.util.ts). */
export interface NormalizedAddress {
  name: string | null
  address: string
}

/* -----------------------------------------------------------------------------
 * Templates
 * -------------------------------------------------------------------------- */

/**
 * Built-in template names provided by this package.
 * Extend by intersecting with `string & {}` to keep strong typing on known
 * values while allowing custom names in host apps.
 */
export type BuiltInTemplate =
  | 'verify-email'
  | 'password-reset'
  | 'magic-login'
  | 'mfa-code'

/**
 * All template names: built-ins plus any custom string.
 * (The `string & {}` trick prevents the union collapsing to `string`.)
 */
export type TemplateName = BuiltInTemplate | (string & {})

/** Arbitrary key/value template variables. */
export type TemplateVars = Record<string, unknown>

/** Template descriptor used when rendering. */
export interface TemplateSpec {
  /** Template identifier (file name, key, etc.). */
  name: TemplateName
  /** Variables injected into the template. */
  vars?: TemplateVars
  /**
   * Optional layout/partials hints for engines that support them.
   * Ignored by simple renderers.
   */
  layout?: string
  partials?: Record<string, string>
}

/* -----------------------------------------------------------------------------
 * Message content & attachments
 * -------------------------------------------------------------------------- */

/**
 * Minimal attachment shape that works across providers.
 * Add fields as needed (contentDisposition, headers, etc.).
 */
export interface Attachment {
  filename?: string
  /** Raw content (string or Buffer). If both `content` and `path` are provided, `content` wins. */
  content?: string | Buffer
  /** Filesystem path or URL (provider must support streaming from it). */
  path?: string
  /** Inline content id (for `<img src="cid:...">`). */
  cid?: string
  /** MIME type (e.g., "text/html"). */
  contentType?: string
  /** Explicit transfer encoding when needed. */
  encoding?: string
}

/* -----------------------------------------------------------------------------
 * Send options & results
 * -------------------------------------------------------------------------- */

/**
 * Options accepted by the high-level EmailService.
 * You may specify raw `html/text`, a `template`, or both (template produces
 * html/text which can be overridden by explicit fields).
 */
export interface MailOptions {
  // Routing
  from?: Address
  to: AddressField
  cc?: AddressField
  bcc?: AddressField
  replyTo?: AddressField

  // Content
  subject: string
  /** Raw text body (providers often generate this from HTML if omitted). */
  text?: string
  /** Raw HTML body. */
  html?: string
  /** Template rendering parameters. */
  template?: TemplateSpec

  // Extras
  attachments?: Attachment[]
  headers?: Record<string, string>
  priority?: 'high' | 'normal' | 'low'
  /** Optional application-defined id for idempotency/correlation. */
  messageId?: string
  /** Bag for provider-agnostic custom metadata. */
  metadata?: Record<string, unknown>
}

/** Envelope resolved by the transport (useful for logs). */
export interface MailEnvelope {
  from?: string
  to?: string[]
  cc?: string[]
  bcc?: string[]
}

/**
 * Provider-agnostic result of a send operation.
 * `providerId` can be the SMTP message-id, provider message id, etc.
 */
export interface SendResult {
  /** Stable id for the message (provider or SMTP message-id). */
  messageId: string
  /** Recipients accepted by the provider. */
  accepted: string[]
  /** Recipients rejected by the provider. */
  rejected: string[]
  /** Optional raw response string (e.g., SMTP 250 OK line). */
  response?: string
  /** Actual envelope used by the transport. */
  envelope?: MailEnvelope
  /** Provider-specific identifier (e.g., SendGrid/Mailgun id). */
  providerId?: string
  /** Round-trip timing or other diagnostics (optional). */
  meta?: Record<string, unknown>
}

/* -----------------------------------------------------------------------------
 * Rendering pipeline (optional but handy for testing)
 * -------------------------------------------------------------------------- */

/** Result of rendering a template (prior to sending). */
export interface RenderedMail {
  subject: string
  html?: string
  text?: string
}

/**
 * Interface for a pluggable template engine (e.g., Handlebars, Nunjucks, MJML).
 * Your EmailModule can bind an implementation to this contract.
 */
export interface TemplateEngine {
  render(spec: TemplateSpec): Promise<RenderedMail>
}

/**
 * Interface for an underlying transport (SMTP, provider API, mock).
 * Keeps EmailService decoupled from the actual transport implementation.
 */
export interface MailTransport {
  send(options: MailOptions): Promise<SendResult>
}
