// types/env.d.ts
// Augments NodeJS.ProcessEnv so env.REDIS_* can be accessed via dot notation
// without tripping `noPropertyAccessFromIndexSignature`.

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Connection
      REDIS_URL?: string
      REDIS_HOST?: string
      REDIS_PORT?: string
      REDIS_DB?: string

      // Auth
      REDIS_USERNAME?: string
      REDIS_PASSWORD?: string

      // Keys / prefixing
      REDIS_KEY_PREFIX?: string

      // TLS
      REDIS_TLS?: '1' | '0' | 'true' | 'false' | 'yes' | 'no' | 'on' | 'off'
      REDIS_TLS_CA?: string // path to CA file
      REDIS_TLS_CERT?: string // path to cert file
      REDIS_TLS_KEY?: string // path to key file
      REDIS_TLS_REJECT_UNAUTHORIZED?: '1' | '0' | 'true' | 'false'

      // Client behavior
      REDIS_MAX_RETRIES_PER_REQUEST?: string // int
      REDIS_COMMAND_TIMEOUT_MS?: string // ms
      REDIS_ENABLE_AUTO_PIPELINING?: '1' | '0' | 'true' | 'false'
      REDIS_LAZY_CONNECT?: '1' | '0' | 'true' | 'false'
      REDIS_KEEP_ALIVE?: string // int (seconds)
      REDIS_CONNECT_TIMEOUT_MS?: string // ms

      // Common extras (optional)
      NODE_ENV?: 'development' | 'test' | 'production'
    }
  }
}

export {}
