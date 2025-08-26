// libs/email/src/lib/providers/template.engine.ts
// -----------------------------------------------------------------------------
// Email Template Engine (Nest provider)
// -----------------------------------------------------------------------------
// Purpose
//   Lightweight façade over ../utils/render.util that prepares calls to
//   `renderEmail({ subject, template })` and emits optional audit crumbs.
//   It does NOT reshape templates; it just forwards your TemplateInput.
//
// Key points
//   - `render(subject, template)` requires a subject (as renderEmail does).
//   - `template` can be a string (template name) or a spec object.
//   - No reliance on a `TemplateName` type (we just use `string`).
//   - We never read `.name` on the object variant to avoid type errors.

import { Inject, Injectable, Optional } from '@nestjs/common'
import type { AuditService } from '@helixai/audit'

import { emailConfig, type EmailConfig } from '../config/email.config'
import { renderEmail, type TemplateInput } from '../utils/render.util'

/* -----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

/** Render result handed to transports. */
export type TemplateRenderResult = {
  html?: string
  text?: string
}

/* -----------------------------------------------------------------------------
 * Safe audit helper (never throws)
 * -------------------------------------------------------------------------- */

function safeAudit(
  auditSvc: AuditService | undefined,
  event: string,
  data?: unknown
): void {
  if (!auditSvc) return
  try {
    const anyA = auditSvc as unknown as {
      emit?: (e: string, d?: unknown) => unknown | Promise<unknown>
      record?: (e: string, d?: unknown) => unknown | Promise<unknown>
      log?: (e: string, d?: unknown) => unknown | Promise<unknown>
    }
    ;(anyA.emit ?? anyA.record ?? anyA.log)?.(event, data)
  } catch {
    /* swallow audit errors */
  }
}

/* -----------------------------------------------------------------------------
 * Provider
 * -------------------------------------------------------------------------- */

@Injectable()
export class EmailTemplateEngine {
  constructor(
    @Inject(emailConfig.KEY) private readonly cfg: EmailConfig,
    @Optional() private readonly audit?: AuditService
  ) {}

  /**
   * Render a template into HTML/text via the shared renderer.
   *
   * @param subject  The final email subject line (required by renderEmail)
   * @param template A concrete TemplateInput (name string or spec object)
   */
  async render(
    subject: string,
    template?: TemplateInput
  ): Promise<TemplateRenderResult> {
    // Graceful no-op: callers may provide raw html/text to transports instead.
    if (!template) return {}

    try {
      const out = await renderEmail({ subject, template })

      // Only include a name when the template is a string; the object form
      // intentionally has no `.name` property in your type.
      safeAudit(this.audit, 'email.template.rendered', {
        subject,
        name: typeof template === 'string' ? template : undefined,
        hasHtml: !!out.html,
        hasText: !!out.text
      })

      return out
    } catch (err) {
      safeAudit(this.audit, 'email.template.render_error', {
        subject,
        name: typeof template === 'string' ? template : undefined,
        error: String(err)
      })
      throw err
    }
  }

  /**
   * Convenience: render by template name (string).
   */
  renderNamed(subject: string, name: string): Promise<TemplateRenderResult> {
    return this.render(subject, name)
  }
}
