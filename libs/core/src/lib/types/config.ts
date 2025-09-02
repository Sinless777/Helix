// libs/core/src/lib/constants/types/config.ts

/* --------------------------------------------------------- *
 * Strict, framework-agnostic configuration types & helpers
 * --------------------------------------------------------- */

/** Runtime environment */
export type Env = 'development' | 'test' | 'staging' | 'production'

/** Branded primitives for extra safety */
export type Url = string & { readonly __brand: 'Url' }
export type IsoDateTime = string & { readonly __brand: 'IsoDateTime' } // e.g., "2025-09-24T12:34:56Z"
export type Semver = string & { readonly __brand: 'Semver' } // e.g., "1.2.3"
export type Milliseconds = number & { readonly __brand: 'Milliseconds' }
export type Seconds = number & { readonly __brand: 'Seconds' }

/** Lightweight helper to brand a URL string */
export const asUrl = (s: string): Url => s as Url

/** Known auth providers used across Helix */
export type AuthProvider = 'discord' | 'google' | 'github' | 'email'

/** Feature flags must be explicitly enumerated to stay type-safe */
export interface FeatureFlags {
  readonly enableDocsRSC?: boolean
  readonly enableAIAssistant?: boolean
  readonly enableRoadmap?: boolean
  readonly enableRBAC?: boolean
  readonly enableMetrics?: boolean
  readonly enableTracing?: boolean
  readonly enableBilling?: boolean
}

/** API endpoints and external services */
export interface ServicesConfig {
  /** Primary API base */
  readonly apiBaseUrl: Url
  /** Realtime / WS endpoint */
  readonly websocketUrl?: Url
  /** CDN base for static/media */
  readonly cdnBaseUrl?: Url
  /** AuthN/Z service base */
  readonly authServiceUrl?: Url
  /** Metrics gateway (Prometheus remote_write, etc.) */
  readonly metricsGatewayUrl?: Url
  /** Tracing collector (OTLP/Tempo/Jaeger) */
  readonly tracingCollectorUrl?: Url

  /** ---- Named service URLs (keyed by friendly name) ---- */
  /** Named databases (e.g., "primary", "analytics", "warehouse") */
  readonly databases?: Readonly<Record<string, Url>>
  /** Named caches (e.g., Redis instances) */
  readonly caches?: Readonly<Record<string, Url>>
  /** Named message queues/brokers (Kafka/RabbitMQ/NATS) */
  readonly messageQueues?: Readonly<Record<string, Url>>
  /** Named object storage endpoints/buckets (S3/R2/MinIO) */
  readonly objectStorage?: Readonly<Record<string, Url>>
  /** Search backends (e.g., elastic, meilisearch, opensearch) */
  readonly search?: Readonly<Record<string, Url>>
  /** Feature stores / vector DBs etc. */
  readonly featureStores?: Readonly<Record<string, Url>>
}

/** Security and compliance knobs */
export interface SecurityConfig {
  /** Allowed origins for CORS (exact origins, not globs) */
  readonly corsAllowedOrigins: readonly Url[]
  /** Content Security Policy as a strict, readonly record */
  readonly contentSecurityPolicy?: Readonly<Record<string, readonly string[]>>
  /** CSRF cookie name and sameSite mode */
  readonly csrf?: {
    readonly cookieName: string
    readonly sameSite: 'lax' | 'strict' | 'none'
    readonly secure: boolean
  }
  /** Whether to enforce HTTPS-only cookies and HSTS */
  readonly hsts?: {
    readonly maxAgeSeconds: Seconds
    readonly includeSubDomains: boolean
    readonly preload: boolean
  }
}

/** Observability suite */
export interface ObservabilityConfig {
  readonly grafanaUrl?: Url
  readonly prometheusUrl?: Url
  readonly lokiUrl?: Url
  readonly tempoUrl?: Url
  readonly pyroscopeUrl?: Url
  /** Error tracking (e.g., Sentry) */
  readonly errorTracking?: {
    readonly dsn: Url
    readonly environmentTag?: string
    readonly sampleRate?: number
    readonly tracesSampleRate?: number
    readonly profilesSampleRate?: number
  }
}

/** Rate limiting per capability */
export interface RateLimitsConfig {
  readonly apiDefaultPerMinute?: number
  readonly authPerMinute?: number
  readonly commandsPerMinute?: number
  readonly uploadsPerHour?: number
}

/** Internationalization */
export type Locale =
  | 'en'
  | 'en-US'
  | 'en-GB'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt-BR'
  | 'ja'
  | 'ko'
  | 'zh-CN'

export interface I18nConfig {
  readonly defaultLocale: Locale
  readonly supportedLocales: readonly Locale[]
}

/** UI + theming */
export type ThemeKey = 'main' | 'docs'

export interface UiConfig {
  readonly defaultTheme: ThemeKey
  readonly allowThemeSwitching: boolean
  readonly primaryColorHex?: `#${string}`
}

/** Build/runtime metadata (filled at build time in CI) */
export interface BuildInfo {
  readonly version: Semver
  readonly commitSha?: string
  readonly buildTime?: IsoDateTime
}

/** Top-level, strictly typed configuration */
export interface HelixConfig {
  readonly env: Env
  readonly services: ServicesConfig
  readonly security: SecurityConfig
  readonly observability?: ObservabilityConfig
  readonly featureFlags?: FeatureFlags
  readonly rateLimits?: RateLimitsConfig
  readonly i18n: I18nConfig
  readonly ui: UiConfig
  readonly build: BuildInfo
}

/* ----------------------------- Helpers ----------------------------- */

/** Simple URL validator (runtime guard) */
function isValidUrl(value: string): value is Url {
  try {
    // Supports custom schemes like postgres://, kafka://, etc.
    new URL(value)
    return true
  } catch {
    return false
  }
}

/** Basic ISO date-time guard */
function isIsoDateTime(value: string): value is IsoDateTime {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
}

/** Naive semver guard (x.y.z). Adjust if you use prereleases/build metadata. */
function isSemver(value: string): value is Semver {
  return /^\d+\.\d+\.\d+$/.test(value)
}

/** Validate a record<string, Url>-like map */
function validateUrlRecord(
  rec: Readonly<Record<string, string | Url>> | undefined,
  path: string,
  problems: string[]
): void {
  if (!rec) return
  for (const [k, v] of Object.entries(rec)) {
    if (!isValidUrl(v)) problems.push(`${path}["${k}"] must be a valid URL`)
  }
}

/**
 * Validate a config instance; returns a list of human-readable issues.
 * Keep this cheap and dependency-free for universal use (node/browser).
 */
export function validateConfig(cfg: HelixConfig): readonly string[] {
  const problems: string[] = []

  // env
  if (!cfg.env) problems.push('env is required')

  // services (required apiBaseUrl)
  if (!cfg.services?.apiBaseUrl || !isValidUrl(cfg.services.apiBaseUrl)) {
    problems.push('services.apiBaseUrl must be a valid URL')
  }
  for (const [k, v] of Object.entries(cfg.services)) {
    if (typeof v === 'string' && k !== 'apiBaseUrl' && v && !isValidUrl(v)) {
      problems.push(`services.${k} must be a valid URL when provided`)
    }
  }

  // named service maps
  validateUrlRecord(cfg.services.databases, 'services.databases', problems)
  validateUrlRecord(cfg.services.caches, 'services.caches', problems)
  validateUrlRecord(
    cfg.services.messageQueues,
    'services.messageQueues',
    problems
  )
  validateUrlRecord(
    cfg.services.objectStorage,
    'services.objectStorage',
    problems
  )
  validateUrlRecord(cfg.services.search, 'services.search', problems)
  validateUrlRecord(
    cfg.services.featureStores,
    'services.featureStores',
    problems
  )

  // security
  if (!cfg.security?.corsAllowedOrigins) {
    problems.push('security.corsAllowedOrigins is required')
  } else {
    cfg.security.corsAllowedOrigins.forEach((o, i) => {
      if (!isValidUrl(o))
        problems.push(`security.corsAllowedOrigins[${i}] must be a valid URL`)
    })
  }
  if (
    cfg.security?.hsts &&
    typeof cfg.security.hsts.maxAgeSeconds !== 'number'
  ) {
    problems.push('security.hsts.maxAgeSeconds must be a number (seconds)')
  }

  // observability (DSN/url checks)
  const obs = cfg.observability
  if (obs?.errorTracking?.dsn && !isValidUrl(obs.errorTracking.dsn)) {
    problems.push('observability.errorTracking.dsn must be a valid URL')
  }

  // i18n
  if (!cfg.i18n?.defaultLocale) problems.push('i18n.defaultLocale is required')
  if (!cfg.i18n?.supportedLocales?.length)
    problems.push('i18n.supportedLocales must include at least one locale')

  // ui
  if (!cfg.ui) problems.push('ui is required')

  // build
  if (!cfg.build?.version || !isSemver(cfg.build.version)) {
    problems.push('build.version must be a valid SemVer (e.g., "1.0.0")')
  }
  if (cfg.build.buildTime && !isIsoDateTime(cfg.build.buildTime)) {
    problems.push(
      'build.buildTime must be an ISO 8601 UTC string (e.g., "2025-01-01T00:00:00Z")'
    )
  }

  return problems
}

/** Freeze recursively for runtime immutability */
export function deepFreeze<T>(obj: T): Readonly<T> {
  // Only attempt to freeze non-null objects/functions
  if (obj && (typeof obj === 'object' || typeof obj === 'function')) {
    Object.freeze(obj as unknown as Record<string, unknown>)
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const val = (obj as Record<string, unknown>)[key]
      if (
        val &&
        (typeof val === 'object' || typeof val === 'function') &&
        !Object.isFrozen(val)
      ) {
        // Recursively freeze; cast is safe for deep immutability
        deepFreeze(val)
      }
    }
  }
  return obj as Readonly<T>
}

/** Build a config and freeze it, throwing if validation fails */
export function makeConfig<const T extends HelixConfig>(cfg: T): Readonly<T> {
  const issues = validateConfig(cfg)
  if (issues.length) {
    throw new Error(`Invalid HelixConfig:\n- ${issues.join('\n- ')}`)
  }
  return deepFreeze(cfg)
}

/* --------------------------- Example config --------------------------- */
/** Example default config (can be overridden per-env by your app) */
export const DefaultConfig = makeConfig({
  env: 'development',
  services: {
    apiBaseUrl: asUrl('https://api.dev.helix.ai'),
    websocketUrl: asUrl('wss://ws.dev.helix.ai'),
    cdnBaseUrl: asUrl('https://cdn.dev.helix.ai'),
    authServiceUrl: asUrl('https://auth.dev.helix.ai'),
    metricsGatewayUrl: asUrl('https://metrics.dev.helix.ai'),
    tracingCollectorUrl: asUrl('https://tempo.dev.helix.ai'),

    // --- Named services (examples) ---
    databases: {
      primary: asUrl('postgres://db-primary.dev.helix.ai:5432/helix'),
      analytics: asUrl('clickhouse://ch.dev.helix.ai:8443/helix'),
      warehouse: asUrl('bigquery://project.dataset')
    },
    caches: {
      default: asUrl('redis://redis.dev.helix.ai:6379/0'),
      session: asUrl('redis://redis.dev.helix.ai:6379/1'),
      rateLimiter: asUrl('redis://redis.dev.helix.ai:6379/2')
    },
    messageQueues: {
      kafka: asUrl('kafka://kafka-1.dev.helix.ai:9092'),
      rabbitmq: asUrl('amqp://rmq.dev.helix.ai:5672'),
      nats: asUrl('nats://nats.dev.helix.ai:4222')
    },
    objectStorage: {
      s3: asUrl('s3://dev-helix-bucket'),
      r2: asUrl('r2://account-id.dev.r2.cloudflarestorage.com/helix'),
      minio: asUrl('s3+http://minio.dev.helix.ai:9000/helix')
    },
    search: {
      elastic: asUrl('https://es.dev.helix.ai:9200'),
      meilisearch: asUrl('http://meili.dev.helix.ai:7700')
    },
    featureStores: {
      vectorDB: asUrl('qdrant://qdrant.dev.helix.ai:6333'),
      feast: asUrl('feast://feast.dev.helix.ai')
    }
  },
  security: {
    corsAllowedOrigins: [
      asUrl('https://dev.helix.ai'),
      asUrl('http://localhost:3000')
    ] as const,
    csrf: {
      cookieName: 'helix.csrf',
      sameSite: 'lax',
      secure: true
    },
    hsts: {
      maxAgeSeconds: 15552000 as Seconds, // 180 days
      includeSubDomains: true,
      preload: false
    },
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'img-src': ["'self'", 'https://cdn.dev.helix.ai'],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'connect-src': [
        "'self'",
        'https://api.dev.helix.ai',
        'wss://ws.dev.helix.ai'
      ]
    } as const
  },
  observability: {
    grafanaUrl: asUrl('https://grafana.dev.helix.ai'),
    prometheusUrl: asUrl('https://prom.dev.helix.ai'),
    lokiUrl: asUrl('https://loki.dev.helix.ai'),
    tempoUrl: asUrl('https://tempo.dev.helix.ai'),
    errorTracking: {
      dsn: asUrl('https://examplePublicKey@o0.ingest.sentry.io/0'),
      environmentTag: 'development',
      sampleRate: 1.0,
      tracesSampleRate: 0.2,
      profilesSampleRate: 0.1
    }
  },
  featureFlags: {
    enableDocsRSC: true,
    enableAIAssistant: true,
    enableRoadmap: true,
    enableRBAC: false,
    enableMetrics: true,
    enableTracing: true,
    enableBilling: false
  },
  rateLimits: {
    apiDefaultPerMinute: 120,
    authPerMinute: 20,
    commandsPerMinute: 60,
    uploadsPerHour: 50
  },
  i18n: {
    defaultLocale: 'en',
    supportedLocales: ['en', 'en-US', 'es', 'fr', 'de'] as const
  },
  ui: {
    defaultTheme: 'main',
    allowThemeSwitching: true,
    primaryColorHex: '#f6066f'
  },
  build: {
    version: '1.0.0' as Semver,
    commitSha: 'dev-local',
    buildTime: '2025-01-01T00:00:00Z' as IsoDateTime
  }
} satisfies HelixConfig)
