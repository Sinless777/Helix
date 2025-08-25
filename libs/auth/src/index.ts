// libs/auth/src/index.ts
// Public API for @helixai/auth
// - Use selective exports to avoid duplicate named exports across files.

//
// Module
//
export { AuthModule } from './lib/auth.module'

//
// Constants / tokens
//
export * from './lib/constants/auth.constants'

//
// Types (selective to avoid collisions)
//
export type * as TokenTypes from './lib/types/token.types'

export type * as AuthTypes from './lib/types/auth.types'

//
// DTOs
//
export * from './lib/dtos/login.dto'
export * from './lib/dtos/oauth-callback.dto'
export * from './lib/dtos/webauthn.dto'

//
// Decorators
//
export * from './lib/decorators/scopes.decorator'
export * from './lib/decorators/org-context.decorator'

//
// Guards & strategy
//
export * from './lib/guards/jwt-auth.guard'
export * from './lib/guards/scopes.guard'
export * from './lib/guards/org-context.guard'
export * from './lib/strategies/jwt.strategy'

//
// Services (export classes explicitly to avoid re-exporting colliding types)
//
export { TokenService } from './lib/services/token.service'
export { JwksService } from './lib/services/jwks.service'
export { TotpService } from './lib/services/totp.service'
export { WebAuthnService } from './lib/services/webauthn.service'

//
// Helper utilities
//
export * from './lib/services/helpers/claims.helper'
export * from './lib/services/helpers/crypto.helper'

//
// Adapters
//
export { RedisTokenAdapter } from './lib/adapters/redis-token.adapter'
export { DbIdentityAdapter } from './lib/adapters/db-identity.adapter'

//
// OAuth provider adapters
//
export { GitHubOAuthAdapter } from './lib/services/oauth/github.adapter'
export { GoogleOAuthAdapter } from './lib/services/oauth/google.adapter'
export { DiscordOAuthAdapter } from './lib/services/oauth/discord.adapter'
export { FacebookOAuthAdapter } from './lib/services/oauth/facebook.adapter'

//
// Background jobs
//
export { JwksRotationJob } from './lib/jobs/jwks-rotation.job'
