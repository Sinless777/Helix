// libs/email/src/lib/providers/transport.factory.ts
// -----------------------------------------------------------------------------
// Email Transport Factory (console provider, idempotency, audit, outbox hook)
// -----------------------------------------------------------------------------

import { Inject, Injectable, Optional, Provider } from '@nestjs/common'
import { randomUUID } from 'node:crypto'

import { emailConfig, type EmailConfig } from '../config/email.config'
import { normalizeAddress } from '../utils/address.util'
import * as RenderUtil from '../utils/render.util'

import type { AuditService } from '@helixai/audit'
import type { CacheRepository, Seconds } from '@helixai/redis'

/* =============================================================================
 * Types (kept local to avoid export drift)
 * ========================================================================== */

export type EmailAddress = { name?: string | null; address: string }
export type AddressLike =
  | string
  | { name?: string | null; address: string }
  | null
  | undefined
export type AddressListLike = AddressLike | AddressLike[]

export type EmailHeaders = Record<string, string>

export type Attachment = {
  filename?: string
  content?: string | Buffer
  path?: string
  href?: string
  contentType?: string
  contentDisposition?: string
  encoding?: string
  cid?: string // inline images
}

export type TemplateSpec = {
  name: string
  props?: Record<string, unknown>
}

export type SendMailInput = {
  from?: AddressLike
  to?: AddressListLike
  cc?: AddressListLike
  bcc?: AddressListLike
  replyTo?: AddressListLike
  subject: string
  html?: string
  text?: string
  template?: TemplateSpec
  /** Template layout name (used only while rendering) */
  layout?: string
  attachments?: Attachment[]
  headers?: EmailHeaders
  /** Label tags we keep on the normalized message */
  tags?: string[]
  messageId?: string
}

export type NormalizedMail = {
  from: EmailAddress
  to?: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  replyTo?: EmailAddress | EmailAddress[]
  subject: string
  html?: string
  text?: string
  attachments?: Attachment[]
  headers?: EmailHeaders
  tags?: string[]
  messageId?: string
}

export type SendResult = {
  messageId: string
  provider?: string
  accepted?: string[]
  rejected?: string[]
}

/* =============================================================================
 * DI token + minimal interfaces
 * ========================================================================== */

export const EMAIL_TRANSPORT = Symbol('EMAIL_TRANSPORT')

export interface EmailTransport {
  send(mail: NormalizedMail): Promise<SendResult>
  health?(): Promise<{ ok: boolean; provider: string; details?: unknown }>
}

export interface EmailOutboxStore {
  save(record: {
    id: string
    provider: string
    envelope: {
      from: string
      to?: string[]
      cc?: string[]
      bcc?: string[]
      replyTo?: string | string[]
    }
    subject: string
    headers?: EmailHeaders
    tags?: string[]
    result: SendResult
    createdAt: Date
  }): Promise<void>
}

/* =============================================================================
 * Helpers
 * ========================================================================== */

function normalizeList(input: AddressListLike): EmailAddress[] | undefined {
  if (input == null) return undefined
  const items = Array.isArray(input) ? input : [input]
  const out: EmailAddress[] = []
  for (const it of items) {
    const n = (
      normalizeAddress as (
        a: unknown
      ) => { name?: string | null; address: string } | undefined
    )(it)
    if (n) out.push({ address: n.address, name: n.name ?? null })
  }
  return out.length ? out : undefined
}

async function renderEmailContent(args: {
  template?: TemplateSpec
  html?: string
  text?: string
  layout?: string
}): Promise<{ html?: string; text?: string }> {
  const maybe = (RenderUtil as any)?.renderEmail as
    | ((a: {
        template?: TemplateSpec
        html?: string
        text?: string
        layout?: string
        defaultVars?: Record<string, unknown>
      }) => Promise<{ html?: string; text?: string }>)
    | undefined
  if (maybe) {
    return maybe({
      template: args.template,
      html: args.html,
      text: args.text,
      layout: args.layout
    })
  }
  return { html: args.html, text: args.text }
}

/* =============================================================================
 * Console transport
 * ========================================================================== */

class ConsoleTransport implements EmailTransport {
  constructor(
    private readonly audit?: AuditService,
    private readonly outbox?: EmailOutboxStore
  ) {}

  async send(msg: NormalizedMail): Promise<SendResult> {
    const messageId = msg.messageId ?? `console-${randomUUID()}@helix`

    const fmt = (xs?: EmailAddress[]) =>
      (xs ?? []).map((x) => `${x.name ? `${x.name} ` : ''}<${x.address}>`)

    // eslint-disable-next-line no-console
    console.log(
      '[email:console]',
      JSON.stringify(
        {
          from: `${msg.from.name ? `${msg.from.name} ` : ''}<${msg.from.address}>`,
          to: fmt(msg.to),
          cc: fmt(msg.cc),
          bcc: fmt(msg.bcc),
          subject: msg.subject,
          text: msg.text?.slice(0, 240) ?? null,
          htmlPreview: msg.html ? `[${msg.html.length} chars]` : null,
          attachments: (msg.attachments ?? []).map((a) => a.filename),
          tags: msg.tags ?? []
        },
        null,
        0
      )
    )

    try {
      await (this.audit as any)?.emit?.('email.sent.console', {
        messageId,
        to: (msg.to ?? []).map((r) => r.address),
        subject: msg.subject
      })
    } catch {
      /* ignore */
    }

    try {
      await this.outbox?.save({
        id: messageId,
        provider: 'console',
        envelope: {
          from: msg.from.address,
          to: (msg.to ?? []).map((x) => x.address),
          cc: (msg.cc ?? []).map((x) => x.address),
          bcc: (msg.bcc ?? []).map((x) => x.address),
          replyTo: Array.isArray(msg.replyTo)
            ? msg.replyTo.map((x) => x.address)
            : msg.replyTo?.address
        },
        subject: msg.subject,
        headers: msg.headers,
        tags: msg.tags,
        result: {
          messageId,
          provider: 'console',
          accepted: (msg.to ?? []).map((x) => x.address)
        },
        createdAt: new Date()
      })
    } catch {
      /* ignore */
    }

    return {
      messageId,
      provider: 'console',
      accepted: (msg.to ?? []).map((x) => x.address),
      rejected: []
    }
  }

  async health() {
    return { ok: true, provider: 'console' as const }
  }
}

/* =============================================================================
 * Facade (normalization, rendering, audit, idempotency)
 * ========================================================================== */

class TransportFacade implements EmailTransport {
  constructor(
    private readonly inner: EmailTransport,
    private readonly cfg: EmailConfig,
    private readonly audit?: AuditService,
    private readonly cache?: CacheRepository,
    private readonly outbox?: EmailOutboxStore
  ) {}

  async send(req: SendMailInput): Promise<SendResult> {
    // 1) From: prefer req.from, fallback to config.defaults.from
    const fromSource = (req.from ?? this.cfg.defaults.from) as unknown
    const fromNorm = (
      normalizeAddress as (
        a: unknown
      ) => { name?: string | null; address: string } | undefined
    )(fromSource)
    if (!fromNorm) throw new Error('email_from_missing')
    const from: EmailAddress = {
      address: fromNorm.address,
      name: fromNorm.name ?? null
    }

    // 2) Recipients
    const to = normalizeList(req.to)
    const cc = normalizeList(req.cc)
    const bcc = normalizeList(req.bcc)
    const replyToList = normalizeList(req.replyTo)
    const replyTo: EmailAddress | EmailAddress[] | undefined =
      replyToList && replyToList.length === 1 ? replyToList[0] : replyToList

    if ((!to || to.length === 0) && (!bcc || bcc.length === 0)) {
      throw new Error('email_recipients_missing')
    }

    // 3) Prepare layout/tags from the request/config (do NOT read off a narrow object)
    const layoutToUse = req.layout ?? this.cfg.defaults.layout
    const tagsToUse: string[] | undefined =
      req.tags ?? this.cfg.defaults.tags ?? undefined

    // 4) Render (template → html/text) if requested
    const { html, text } = await renderEmailContent({
      template: req.template,
      html: req.html,
      text: req.text,
      layout: layoutToUse
    })

    // 5) Build normalized message (full shape)
    const normalized: NormalizedMail = {
      from,
      to,
      cc,
      bcc,
      replyTo,
      subject: req.subject,
      html,
      text,
      attachments: req.attachments ?? [],
      headers: req.headers ?? {},
      tags: tagsToUse,
      messageId: req.messageId
    }

    // 6) Idempotency via Redis
    const idemKey =
      normalized.headers?.['Idempotency-Key'] ??
      normalized.headers?.['idempotency-key']
    if (this.cache && idemKey) {
      const cacheKey = `email:idemp:${idemKey}`
      const cached = await this.cache.getJSON<SendResult>(cacheKey)
      if (cached?.messageId) {
        await this.safeAudit('email.idempotent.hit', {
          key: idemKey,
          messageId: cached.messageId
        })
        return cached
      }
      const sent = await this.withAuditSend(normalized)
      const ttl: Seconds = 600 as Seconds // 10m default
      await this.cache.setJSON(cacheKey, sent, ttl).catch(() => void 0)
      return sent
    }

    // 7) Regular send
    return this.withAuditSend(normalized)
  }

  async health() {
    return (await this.inner.health?.()) ?? { ok: true, provider: 'unknown' }
  }

  private async withAuditSend(message: NormalizedMail): Promise<SendResult> {
    // NOTE: the parameter is named `message` (not `mail`) to avoid any chance
    // of later creating a `{ from, replyTo }` object and confusing TS.
    await this.safeAudit('email.send.begin', {
      to: (message.to ?? []).map((r) => r.address),
      subject: message.subject
    })
    try {
      const res = await this.inner.send(message)

      try {
        await this.outbox?.save({
          id: res.messageId,
          provider: res.provider ?? 'unknown',
          envelope: {
            from: message.from.address,
            to: (message.to ?? []).map((x) => x.address),
            cc: (message.cc ?? []).map((x) => x.address),
            bcc: (message.bcc ?? []).map((x) => x.address),
            replyTo: Array.isArray(message.replyTo)
              ? message.replyTo.map((x) => x.address)
              : message.replyTo?.address
          },
          subject: message.subject,
          headers: message.headers,
          tags: message.tags,
          result: res,
          createdAt: new Date()
        })
      } catch {
        /* ignore */
      }

      await this.safeAudit('email.send.ok', {
        messageId: res.messageId,
        provider: res.provider ?? 'unknown'
      })
      return res
    } catch (err) {
      await this.safeAudit('email.send.error', {
        error: String(err),
        subject: message.subject
      })
      throw err
    }
  }

  private async safeAudit(event: string, data?: unknown) {
    try {
      await (this.audit as any)?.emit?.(event, data)
    } catch {
      /* ignore */
    }
  }
}

/* =============================================================================
 * Factory provider
 * ========================================================================== */

@Injectable()
export class EmailTransportFactory {
  constructor(
    @Inject(emailConfig.KEY) private readonly cfg: EmailConfig,
    @Optional() private readonly audit?: AuditService,
    @Optional() private readonly cache?: CacheRepository,
    @Optional() private readonly outbox?: EmailOutboxStore
  ) {}

  create(): EmailTransport {
    const providerName = (this.cfg.provider ?? 'console').toLowerCase()
    let base: EmailTransport

    switch (providerName) {
      case 'noop':
        base = new ConsoleTransport(this.audit, this.outbox)
        break
      case 'console':
      default:
        base = new ConsoleTransport(this.audit, this.outbox)
        break
    }

    return new TransportFacade(
      base,
      this.cfg,
      this.audit,
      this.cache,
      this.outbox
    )
  }
}

export const EmailTransportProvider: Provider = {
  provide: EMAIL_TRANSPORT,
  useFactory: (factory: EmailTransportFactory) => factory.create(),
  inject: [EmailTransportFactory]
}
