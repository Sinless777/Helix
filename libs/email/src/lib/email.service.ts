// libs/email/src/lib/email.service.ts
// -----------------------------------------------------------------------------
// EmailService
// -----------------------------------------------------------------------------
// Responsibilities
//   • Choose and initialize a transport (via transport.factory)
//   • Optionally render a template (via TemplateEngine)
//   • Send the message and record best-effort audit metadata
// -----------------------------------------------------------------------------

import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional
} from '@nestjs/common'
import { emailConfig, type EmailConfig } from './config/email.config'
import type { AuditService } from '@helixai/audit'

import { EmailTemplateEngine } from './providers/template.engine'
import * as TransportFactory from './providers/transport.factory'

// Types derived from the factory so we stay in-sync with the transport layer
type EmailTransport = TransportFactory.EmailTransport
type SendResult = TransportFactory.SendResult

// Rendered output type = return type of the template engine's `render`
type Rendered = Awaited<ReturnType<EmailTemplateEngine['render']>>

// Convenience: input type for EmailTransport.send (kept in one place)
type TransportInput = Parameters<EmailTransport['send']>[0]

// Best-effort audit helper that never throws
async function audit(
  auditSvc: AuditService | undefined,
  event: string,
  data?: unknown
) {
  if (!auditSvc) return
  const anyAudit: any = auditSvc
  try {
    if (typeof anyAudit.emit === 'function') await anyAudit.emit(event, data)
    else if (typeof anyAudit.record === 'function')
      await anyAudit.record(event, data)
    else if (typeof anyAudit.log === 'function') await anyAudit.log(event, data)
  } catch {
    /* swallow audit errors */
  }
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly log = new Logger(EmailService.name)

  private transport!: EmailTransport
  private readonly cfg: EmailConfig

  constructor(
    @Inject(emailConfig.KEY) cfg: EmailConfig,
    private readonly templates: EmailTemplateEngine,
    @Optional() private readonly auditSvc?: AuditService
  ) {
    this.cfg = cfg
  }

  async onModuleInit() {
    // Probe multiple export names so we tolerate minor refactors in the factory
    const factoryCandidate =
      // @ts-expect-error – intentional probing
      TransportFactory.createTransport ??
      // @ts-expect-error – legacy name
      TransportFactory.createEmailTransport ??
      (TransportFactory as any).default

    if (typeof factoryCandidate !== 'function') {
      throw new Error('email_transport_factory_missing')
    }

    this.transport = factoryCandidate(this.cfg, {
      audit: this.auditSvc
    }) as EmailTransport

    // Don’t rely on a `.kind` property (not part of the public type)
    this.log.log(`Email transport initialized`)
  }

  /**
   * Send an email. If `template` is provided, we render (html/text) first.
   * We keep the caller’s `subject` unless they later decide to let templates
   * define it; our template engine’s result doesn’t guarantee a `subject`.
   */
  async send(input: TransportInput): Promise<SendResult> {
    let rendered: Rendered | undefined

    // Render only when a template was provided
    if ((input as any).template) {
      // Current engine signature: render(template, context?)
      rendered = await this.templates.render(
        (input as any).template,
        (input as any).context
      )
    }

    // Merge rendered parts (html/text) back into the transport input.
    // We DO NOT assume a rendered subject exists; we keep the caller's subject.
    const merged: TransportInput = {
      ...(input as any),
      ...(rendered?.html ? { html: rendered.html } : null),
      ...(rendered?.text ? { text: rendered.text } : null)
    }

    const result = await this.transport.send(merged)

    // Best-effort audit (avoid relying on provider-specific fields)
    await audit(this.auditSvc, 'email.sent', {
      subject: (merged as any).subject ?? null,
      accepted: Array.isArray(result.accepted) ? result.accepted.length : 0,
      rejected: Array.isArray(result.rejected) ? result.rejected.length : 0,
      messageId: (result as any).messageId ?? null,
      tags: (merged as any).tags ?? undefined
    })

    return result
  }

  /** Lightweight ping for health checks / smoke tests. */
  async ping(to: string): Promise<boolean> {
    try {
      const res = await this.send({
        to,
        subject: 'Hello from Helix EmailService',
        text: 'If you received this, outbound email is working.'
      } as unknown as TransportInput)

      const ok = Array.isArray(res.accepted) && res.accepted.length > 0
      if (!ok)
        this.log.warn(
          `Ping mail not accepted by provider: ${JSON.stringify(res)}`
        )
      return ok
    } catch (err) {
      this.log.error(`Ping mail failed: ${String(err)}`)
      return false
    }
  }
}
