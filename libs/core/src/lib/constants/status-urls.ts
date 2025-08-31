// libs/core/src/lib/constants/status-urls.ts

/**
 * @name StatusUrls
 *
 * Canonical, strongly-typed list of vendor status endpoints used across the
 * platform. Most entries are backed by Atlassian Statuspage which exposes a
 * consistent JSON API at:
 *   • `/api/v2/summary.json`  → components + incidents + overall indicator
 *   • `/api/v2/status.json`   → overall indicator only ("none", "minor", ...)
 *
 * Why keep this here?
 *   - Single source of truth for status URLs ⟹ shared by workers, backend, UI
 *   - Easier to mock in tests (import the map and override a few keys)
 *   - Avoids hard‑coded URLs sprinkled throughout services
 *
 * Notes & caveats:
 *   - **GCP** does not use Statuspage and exposes a *different* JSON schema.
 *   - **AWS** public pages are HTML; programmatic access is via AWS Health API.
 *   - Treat these endpoints as public-read; do not attach auth headers.
 *   - Be kind to rate limits—cache responses centrally if you poll frequently.
 *
 * Example (Node):
 *   const res = await fetch(StatusUrls.cloudflare.summary)
 *   const json = await res.json()
 */
export const StatusUrls = {
  // ───────────────────────────── Discord / CDN ──────────────────────────────
  /** Discord status (Statuspage JSON). */
  discord: {
    summary: 'https://discordstatus.com/api/v2/summary.json',
    status: 'https://discordstatus.com/api/v2/status.json'
  },
  /** Cloudflare status (Statuspage JSON). */
  cloudflare: {
    summary: 'https://www.cloudflarestatus.com/api/v2/summary.json',
    status: 'https://www.cloudflarestatus.com/api/v2/status.json'
  },

  // ───────────────────────── Dev infra / platforms ──────────────────────────
  /** GitHub (Statuspage). */
  github: {
    summary: 'https://www.githubstatus.com/api/v2/summary.json',
    status: 'https://www.githubstatus.com/api/v2/status.json'
  },
  /** GitLab (Statuspage). */
  gitlab: {
    summary: 'https://status.gitlab.com/api/v2/summary.json',
    status: 'https://status.gitlab.com/api/v2/status.json'
  },
  /** DigitalOcean (Statuspage). */
  digitalocean: {
    summary: 'https://status.digitalocean.com/api/v2/summary.json',
    status: 'https://status.digitalocean.com/api/v2/status.json'
  },
  /** Vercel (Statuspage). */
  vercel: {
    summary: 'https://www.vercel-status.com/api/v2/summary.json',
    status: 'https://www.vercel-status.com/api/v2/status.json'
  },
  /** Netlify (Statuspage). */
  netlify: {
    summary: 'https://www.netlifystatus.com/api/v2/summary.json',
    status: 'https://www.netlifystatus.com/api/v2/status.json'
  },
  /** Render (Statuspage). */
  render: {
    summary: 'https://status.render.com/api/v2/summary.json',
    status: 'https://status.render.com/api/v2/status.json'
  },
  /** Fly.io (Statuspage). */
  flyio: {
    summary: 'https://status.flyio.net/api/v2/summary.json',
    status: 'https://status.flyio.net/api/v2/status.json'
  },
  /** Heroku (Statuspage). */
  heroku: {
    summary: 'https://status.heroku.com/api/v2/summary.json',
    status: 'https://status.heroku.com/api/v2/status.json'
  },
  /** Linode/Akamai (Statuspage). */
  linode: {
    summary: 'https://status.linode.com/api/v2/summary.json',
    status: 'https://status.linode.com/api/v2/status.json'
  },

  // ──────────────────────── Databases / back-end services ───────────────────
  /** Supabase (Statuspage). */
  supabase: {
    summary: 'https://status.supabase.com/api/v2/summary.json',
    status: 'https://status.supabase.com/api/v2/status.json'
  },
  /** PlanetScale (Statuspage). */
  planetscale: {
    summary: 'https://status.planetscale.com/api/v2/summary.json',
    status: 'https://status.planetscale.com/api/v2/status.json'
  },
  /** MongoDB Atlas (Statuspage). */
  mongodbAtlas: {
    summary: 'https://status.cloud.mongodb.com/api/v2/summary.json',
    status: 'https://status.cloud.mongodb.com/api/v2/status.json'
  },
  /** Upstash (Statuspage). */
  upstash: {
    summary: 'https://status.upstash.com/api/v2/summary.json',
    status: 'https://status.upstash.com/api/v2/status.json'
  },
  /** Neon (Statuspage). */
  neon: {
    summary: 'https://status.neon.tech/api/v2/summary.json',
    status: 'https://status.neon.tech/api/v2/status.json'
  },
  /** CockroachDB (Cockroach Labs) (Statuspage). */
  cockroachdb: {
    summary: 'https://status.cockroachlabs.com/api/v2/summary.json',
    status: 'https://status.cockroachlabs.com/api/v2/status.json'
  },

  // ─────────────────────────── Observability / Ops ──────────────────────────
  /** Datadog (Statuspage). */
  datadog: {
    summary: 'https://status.datadoghq.com/api/v2/summary.json',
    status: 'https://status.datadoghq.com/api/v2/status.json'
  },
  /** PagerDuty (Statuspage). */
  pagerduty: {
    summary: 'https://status.pagerduty.com/api/v2/summary.json',
    status: 'https://status.pagerduty.com/api/v2/status.json'
  },
  /** New Relic (Statuspage). */
  newrelic: {
    summary: 'https://status.newrelic.com/api/v2/summary.json',
    status: 'https://status.newrelic.com/api/v2/status.json'
  },
  /** Sentry (Statuspage). */
  sentry: {
    summary: 'https://status.sentry.io/api/v2/summary.json',
    status: 'https://status.sentry.io/api/v2/status.json'
  },
  /** Fastly (Statuspage). */
  fastly: {
    summary: 'https://status.fastly.com/api/v2/summary.json',
    status: 'https://status.fastly.com/api/v2/status.json'
  },

  // ───────────────────────────── Payments / Billing ─────────────────────────
  /** Stripe (Statuspage). */
  stripe: {
    summary: 'https://status.stripe.com/api/v2/summary.json',
    status: 'https://status.stripe.com/api/v2/status.json'
  },
  /** PayPal (Statuspage). */
  paypal: {
    summary: 'https://www.paypal-status.com/api/v2/summary.json',
    status: 'https://www.paypal-status.com/api/v2/status.json'
  },
  /** Coinbase (Statuspage). */
  coinbase: {
    summary: 'https://www.coinbasestatus.com/api/v2/summary.json',
    status: 'https://www.coinbasestatus.com/api/v2/status.json'
  },

  // ─────────────────────────── Messaging / Communications ───────────────────
  /** Twilio (Statuspage). */
  twilio: {
    summary: 'https://status.twilio.com/api/v2/summary.json',
    status: 'https://status.twilio.com/api/v2/status.json'
  },
  /** SendGrid (Statuspage). */
  sendgrid: {
    summary: 'https://status.sendgrid.com/api/v2/summary.json',
    status: 'https://status.sendgrid.com/api/v2/status.json'
  },
  /** Mailgun (Statuspage). */
  mailgun: {
    summary: 'https://status.mailgun.com/api/v2/summary.json',
    status: 'https://status.mailgun.com/api/v2/status.json'
  },
  /** Postmark (Statuspage). */
  postmark: {
    summary: 'https://status.postmarkapp.com/api/v2/summary.json',
    status: 'https://status.postmarkapp.com/api/v2/status.json'
  },

  // ────────────────────────── Developer SaaS / Tooling ─────────────────────
  /** OpenAI (Statuspage). */
  openai: {
    summary: 'https://status.openai.com/api/v2/summary.json',
    status: 'https://status.openai.com/api/v2/status.json'
  },
  /** npm registry (Statuspage). */
  npm: {
    summary: 'https://status.npmjs.org/api/v2/summary.json',
    status: 'https://status.npmjs.org/api/v2/status.json'
  },
  /** Slack (Statuspage). */
  slack: {
    summary: 'https://status.slack.com/api/v2/summary.json',
    status: 'https://status.slack.com/api/v2/status.json'
  },
  /** Atlassian (umbrella) (Statuspage). */
  atlassian: {
    summary: 'https://www.atlassianstatus.com/api/v2/summary.json',
    status: 'https://www.atlassianstatus.com/api/v2/status.json'
  },
  /** Bitbucket (under Atlassian Statuspage). */
  bitbucket: {
    summary: 'https://bitbucket.status.atlassian.com/api/v2/summary.json',
    status: 'https://bitbucket.status.atlassian.com/api/v2/status.json'
  },

  // ───────────────────────── Cloud vendors (special cases) ──────────────────
  gcp: {
    /**
     * Google Cloud **does not** use Statuspage. Instead, it exposes a public
     * JSON incidents feed. The shape differs from Statuspage (different keys),
     * so any consumer must branch on provider when parsing.
     *
     *   • `summary` → JSON feed of incidents (historical + current)
     *   • `status`  → HTML landing page for humans
     */
    summary: 'https://status.cloud.google.com/incidents.json', // JSON feed
    status: 'https://status.cloud.google.com' // HTML
  },
  aws: {
    /**
     * AWS public status is **HTML** only. For programmatic access use the AWS
     * Health API (requires permissions/plan). The `summary` here points to the
     * new Health dashboard; `status` to the legacy global status page.
     *
     * If you need JSON without AWS Health, consider an internal scraper or a
     * third‑party feed—do **not** hammer these HTML pages directly from apps.
     */
    summary: 'https://health.aws.amazon.com/health/status', // HTML dashboard
    status: 'https://status.aws.amazon.com/' // legacy HTML
  }
} as const

/** Narrowed union of provider keys, useful for typing helpers. */
export type StatusProvider = keyof typeof StatusUrls
