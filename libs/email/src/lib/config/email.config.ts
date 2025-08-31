// libs/email/src/lib/config/email.config.ts
// -----------------------------------------------------------------------------
// Typed Email config (Nest @nestjs/config + Zod).
// - Supports simple SMTP settings (dev defaults target Mailpit).
// - Parses "from"/"replyTo" into normalized { name, address }.
// - Exposes a helper to build minimal SMTP connection options.
// -----------------------------------------------------------------------------

import { registerAs } from '@nestjs/config'
import { z } from 'zod'
import { normalizeAddress } from '../utils/address.util'

// Keep this file dependency-light and nodemailer-agnostic
export type SmtpAuth = { user: string; pass: string }
export type SmtpOptions = {
  host: string
  port: number
  secure: boolean
  auth?: SmtpAuth
}

export type EmailAddress = { name?: string | null; address: string }
export type EmailConfig = {
  provider: 'smtp' // placeholder for future providers
  smtp: SmtpOptions
  defaults: {
    tags: string[] | undefined
    layout?: string | undefined
    from: EmailAddress
    replyTo?: EmailAddress
  }
  // Optional app hints that templates may use
  branding?: {
    productName?: string
    supportUrl?: string
  }
}

/* -----------------------------------------------------------------------------
 * Zod schema (validates env-derived values)
 * -------------------------------------------------------------------------- */

const zBool = z
  .union([
    z.literal('true'),
    z.literal('false'),
    z.literal('1'),
    z.literal('0')
  ])
  .transform((v) => v === 'true' || v === '1')

const zInt = z
  .string()
  .regex(/^\d+$/)
  .transform((v) => parseInt(v, 10))

const AddressSchema = z
  .string()
  .min(1)
  .transform((v) => normalizeAddress(v))

const EmailSchema = z.object({
  provider: z.literal('smtp').default('smtp'),
  smtp: z.object({
    host: z.string().min(1),
    port: z.number().int().positive(),
    secure: z.boolean(),
    auth: z
      .object({
        user: z.string().min(1),
        pass: z.string().min(1)
      })
      .optional()
  }),
  defaults: z.object({
    tags: z.array(z.string()).optional(),
    from: z.custom<EmailAddress>(),
    replyTo: z.custom<EmailAddress>().optional(),
    layout: z.string().min(1).optional()
  }),
  branding: z
    .object({
      productName: z.string().optional(),
      supportUrl: z.string().url().optional()
    })
    .partial()
    .optional()
})

/* -----------------------------------------------------------------------------
 * Helper: read env with safe bracket notation (avoids TS index-signature lint)
 * -------------------------------------------------------------------------- */

function env(key: string): string | undefined {
  return process.env[key]
}

/* -----------------------------------------------------------------------------
 * registerAs('email', ...) — actual config factory
 * -------------------------------------------------------------------------- */

export const emailConfig = registerAs('email', (): EmailConfig => {
  // Decide dev defaults (Mailpit) vs explicit SMTP
  const nodeEnv = env('NODE_ENV') ?? 'development'
  const isProd = nodeEnv === 'production'

  // Dev-friendly defaults (Mailpit container)
  const devHost = env('MAILPIT_SMTP_HOST') ?? 'mailpit'
  const mailpitPortStr = env('MAILPIT_SMTP_PORT')
  const devPort = mailpitPortStr ? parseInt(mailpitPortStr, 10) : 1025

  // Explicit SMTP overrides (if provided)
  const host = env('MAIL_HOST') ?? (isProd ? 'localhost' : devHost)

  const mailPortStr = env('MAIL_PORT')
  const port = mailPortStr ? parseInt(mailPortStr, 10) : isProd ? 587 : devPort

  const mailSecureStr = env('MAIL_SECURE')
  const secure = mailSecureStr != null ? zBool.parse(mailSecureStr) : false // 465 → true; 587/1025 → false

  const user = env('MAIL_USER') ?? ''
  const pass = env('MAIL_PASS') ?? ''

  // Build auth only when both present (avoids auth:{} with blanks)
  const auth = user && pass ? ({ user, pass } satisfies SmtpAuth) : undefined

  // From / Reply-To (accepts `'"Name" <addr@example.com>'` or `addr@example.com`)
  const fromRaw = env('MAIL_FROM') ?? '"Helix Mailer" <no-reply@localhost>' // safe default for dev
  const replyToRaw = env('MAIL_REPLY_TO')

  // Optional branding hints (used by templates)
  const branding = {
    productName: env('EMAIL_BRAND_NAME'),
    supportUrl: env('EMAIL_SUPPORT_URL')
  }
  const brandingClean =
    branding.productName || branding.supportUrl ? branding : undefined

  // Tags (comma-delimited)
  const tagsStr = env('EMAIL_TAGS')
  const tags =
    tagsStr !== undefined
      ? tagsStr
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined

  const emailLayout = env('EMAIL_LAYOUT')

  const raw = {
    provider: 'smtp' as const,
    smtp: { host, port, secure, auth },
    defaults: {
      tags,
      from: normalizeAddress(fromRaw),
      replyTo: replyToRaw ? normalizeAddress(replyToRaw) : undefined,
      layout: emailLayout !== undefined ? emailLayout : undefined // always include layout key; may be undefined
    },
    branding: brandingClean
  }

  // Validate; throws on misconfiguration (Nest will surface at boot)
  const parsed = EmailSchema.parse(raw)

  // Normalize the parsed object into the explicit EmailConfig shape so all
  // required keys (like defaults.tags) are present even when undefined.
  const final: EmailConfig = {
    provider: parsed.provider,
    smtp: parsed.smtp,
    defaults: {
      // ensure the 'tags' key is present (may be undefined)
      tags: 'tags' in parsed.defaults ? parsed.defaults.tags : undefined,
      layout: 'layout' in parsed.defaults ? parsed.defaults.layout : undefined,
      from: parsed.defaults.from,
      replyTo: parsed.defaults.replyTo
    },
    branding: parsed.branding
  }

  return final
})

/* -----------------------------------------------------------------------------
 * Tiny helper: extract SMTP options for transport factories
 * -------------------------------------------------------------------------- */

export function asSmtpOptions(cfg: EmailConfig): SmtpOptions {
  return {
    host: cfg.smtp.host,
    port: cfg.smtp.port,
    secure: cfg.smtp.secure,
    auth: cfg.smtp.auth
  }
}

// Re-export the config key type for DI lookups if desired
export type EmailConfigKey = typeof emailConfig.KEY
