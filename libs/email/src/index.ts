// libs/email/src/index.ts

// Core module & service
export * from './lib/email.module'
export * from './lib/email.service'

// Types — single source of truth for domain types
export * from './lib/types/email.types'

// Config — avoid re-exporting types here to prevent name clashes
export { emailConfig, type EmailConfig } from './lib/config/email.config'

// DTOs
export * from './lib/dtos/send-mail.dto'

// Utilities
export * from './lib/utils/address.util'
export * from './lib/utils/render.util'

// Providers
// Use star exports to avoid hardcoding symbol names that may drift.
// (If these files export overlapping type names, the types package remains canonical.)
export * from './lib/providers/template.engine'
// Export transport provider as a namespace to avoid re-export name collisions with types
export * as transportFactory from './lib/providers/transport.factory'
