// libs/email/src/lib/utils/render.util.ts
// -----------------------------------------------------------------------------
// Lightweight, dependency-optional rendering helpers for email content.
// Focus: tiny string interpolation, optional MJML → HTML, HTML→text fallback.
// -----------------------------------------------------------------------------

/* =============================================================================
 * Local types (kept minimal to avoid cross-file coupling)
 * ========================================================================== */

export type RenderCtx = Record<string, unknown>

export type TemplateInput =
  | string
  | {
      /** Raw HTML or MJML string. If you pass MJML, set `isMjml:true` or let auto-detect kick in. */
      body: string
      /** Optional plain-text template. If omitted, html→text fallback is used. */
      text?: string
      /** Subject template. If omitted, it can be provided separately to renderEmail. */
      subject?: string
      /** Explicit hint this is MJML (skips auto-detect). */
      isMjml?: boolean
    }

export interface RenderOptions {
  /**
   * When interpolating HTML, escape values by default to avoid XSS via user data.
   * For subject/text, escaping is disabled by default.
   */
  escapeHtml?: boolean
  /**
   * If true, attempt to compile MJML to HTML (dynamic import). If false, skip.
   * Default: auto (true when content looks like MJML).
   */
  useMjml?: boolean
}

export interface RenderedEmail {
  subject: string
  html?: string
  text?: string
}

/* =============================================================================
 * Tiny helpers
 * ========================================================================== */

/** Minimal HTML escape (enough for interpolating untrusted values into HTML). */
export function escapeHtml(input: unknown): string {
  const s = String(input ?? '')
  // order matters: escape & first to avoid double-escaping later
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** Get a nested value using dot-paths, e.g., get(ctx, 'user.name.first'). */
function get(ctx: RenderCtx, path: string): unknown {
  if (!path) return undefined
  const parts = path
    .split('.')
    .map((p) => p.trim())
    .filter(Boolean)
  let cur: any = ctx
  for (const key of parts) {
    if (cur == null) return undefined
    cur = cur[key]
  }
  return cur
}

/**
 * Interpolate a template string using {{ path }} and {{{ path }}} tokens.
 * - {{ path }}     → HTML-escaped (if `opts.escapeHtml` true)
 * - {{{ path }}}   → raw/unescaped
 */
export function interpolate(
  template: string,
  ctx: RenderCtx,
  opts?: { escapeHtml?: boolean }
): string {
  const escape = opts?.escapeHtml ?? false
  const re = /{{{\s*([^}]+)\s*}}}|{{\s*([^}]+)\s*}}/g
  return template.replace(re, (_, rawPath, escPath) => {
    const path = (rawPath ?? escPath ?? '').trim()
    const val = get(ctx, path)
    const str = val == null ? '' : String(val)
    return rawPath ? str : escape ? escapeHtml(str) : str
  })
}

/**
 * Heuristic MJML detector. We keep it conservative: only treat as MJML when
 * the trimmed content starts with the <mjml ...> root element.
 */
function looksLikeMjml(s: string): boolean {
  const t = s.trimStart()
  // Case-insensitive check for `<mjml`
  return /^<\s*mjml[\s>]/i.test(t)
}

/**
 * Try to compile MJML → HTML via a dynamic import of the 'mjml' package.
 * If 'mjml' is not installed, simply return the input string.
 *
 * Notes:
 *  - We intentionally avoid a type import for 'mjml' so TS doesn't require its
 *    types at compile time. The `@ts-ignore` below suppresses the missing module
 *    diagnostic if the dep isn't present in this workspace.
 */
export async function renderMjmlIfAny(
  maybeMjml: string,
  force = false
): Promise<string> {
  const should = force || looksLikeMjml(maybeMjml)
  if (!should) return maybeMjml

  let mjmlFn: any
  try {
    // @ts-expect-error -- optional dependency (no types required at compile time)
    const mod = await import('mjml')
    mjmlFn = mod?.default ?? mod
  } catch {
    // No mjml available at runtime → pass-through.
    return maybeMjml
  }

  try {
    const result = mjmlFn(maybeMjml, { validationLevel: 'soft' })
    const errs = (result?.errors ?? []) as Array<{
      formattedMessage?: string
      message?: string
    }>
    const html = String(result?.html ?? '')
    if (errs.length) {
      const msg = errs
        .map((e) => e.formattedMessage ?? e.message ?? String(e))
        .join('\n')
      return `<!-- mjml validation warnings:\n${escapeHtml(msg)}\n-->\n${html}`
    }
    return html
  } catch {
    // If MJML parsing blows up, return the original string to avoid hard failures.
    return maybeMjml
  }
}

/**
 * Very small HTML → text fallback. This is not a full fidelity converter,
 * but is good enough for transactional emails.
 */
export function htmlToText(html: string): string {
  let s = html

  // Preserve common block/line breaks
  s = s.replace(/<(?:br|hr)\s*\/?>/gi, '\n')
  s = s.replace(/<\/p\s*>/gi, '\n\n')
  s = s.replace(/<\/(h[1-6]|li|div|section|article|tr)\s*>/gi, '\n')

  // Strip all remaining tags
  s = s.replace(/<[^>]+>/g, '')

  // Decode a few common entities
  s = s
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")

  // Collapse excessive whitespace
  s = s.replace(/[ \t]+\n/g, '\n')
  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim()
}

/* =============================================================================
 * High-level renderers
 * ========================================================================== */

/**
 * Render subject/html/text in a single call.
 * - `subject` is interpolated with escaping OFF (safe for plain text).
 * - `body` is interpolated with escaping ON (when used as HTML).
 * - If `text` is not provided, we derive it from the rendered HTML body.
 */
export async function renderEmail(
  args: {
    subject: string
    template: TemplateInput
    context?: RenderCtx
  },
  options?: RenderOptions
): Promise<RenderedEmail> {
  const ctx = args.context ?? {}

  // Normalize the "template" argument to a structured form.
  let body: string
  let textExplicit: string | undefined
  let isMjml = false

  if (typeof args.template === 'string') {
    body = args.template
    isMjml = looksLikeMjml(body)
  } else {
    body = args.template.body
    textExplicit = args.template.text
    isMjml = !!args.template.isMjml || looksLikeMjml(body)
  }

  // Subject: interpolate without HTML escaping (plain text).
  const subject = interpolate(args.subject, ctx, { escapeHtml: false })

  // Body (HTML or MJML): interpolate first, escape placeholders (safe for HTML).
  const interpolatedBody = interpolate(body, ctx, {
    escapeHtml: options?.escapeHtml ?? true
  })

  // MJML compile if needed/allowed.
  const wantMjml = options?.useMjml ?? isMjml
  const html = await renderMjmlIfAny(interpolatedBody, wantMjml)

  // Text: explicit template wins; otherwise derive from HTML.
  const text =
    typeof textExplicit === 'string'
      ? interpolate(textExplicit, ctx, { escapeHtml: false })
      : htmlToText(html)

  return { subject, html, text }
}

/**
 * Convenience: render just a subject string with interpolation (no escaping).
 */
export function renderSubject(template: string, ctx?: RenderCtx): string {
  return interpolate(template, ctx ?? {}, { escapeHtml: false })
}

/**
 * Convenience: render a simple HTML snippet (no MJML) with HTML-escaping on.
 */
export function renderHtml(template: string, ctx?: RenderCtx): string {
  return interpolate(template, ctx ?? {}, { escapeHtml: true })
}

/**
 * Convenience: render a simple plaintext snippet with interpolation.
 */
export function renderText(template: string, ctx?: RenderCtx): string {
  return interpolate(template, ctx ?? {}, { escapeHtml: false })
}
