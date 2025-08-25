// libs/auth/src/lib/auth.module.ts
// -----------------------------------------------------------------------------
// AuthModule
// -----------------------------------------------------------------------------
// What this module does:
//   • Registers and re-exports core auth services (Token/JWKS/TOTP/WebAuthn)
//   • Exposes guards (JWT/Scopes/OrgContext) and the JWT strategy
//   • Makes the JWKS rotation job available (opt-in by app)
//   • Provides OAuth adapters (GitHub/Google/Discord/Facebook)
//   • Exposes DB/Redis adapters used by the TokenService and auth flows
//
// Important design notes:
//   • This module does NOT hard-import database/redis/scheduler modules to keep
//     coupling low. Bring those in at the app (or feature) module level.
//   • If your TokenService (or other providers) depend on specific injection
//     tokens (e.g., an AUTH_CONFIG provider, Redis client, EntityManager, etc.),
//     ensure those are provided by the consuming app. Most dependencies in this
//     library are marked @Optional so it compiles and loads cleanly even when
//     those infra pieces are not present in unit tests or partial setups.
//
// Typical usage in an AppModule:
//   @Module({
//     imports: [
//       RedisModule.forRoot({...}),
//       MikroOrmModule.forRoot({...}),
//       // If you have a config factory, provide it here:
//       // { provide: AUTH_CONFIG, useValue: resolveAuthConfigFromEnv() },
//       AuthModule,
//     ],
//   })
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common'

// Core services
import { TokenService } from './services/token.service'
import { JwksService } from './services/jwks.service'
import { TotpService } from './services/totp.service'
import { WebAuthnService } from './services/webauthn.service'

// Guards & strategy
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { ScopesGuard } from './guards/scopes.guard'
import { OrgContextGuard } from './guards/org-context.guard'
import { JwtStrategy } from './strategies/jwt.strategy'

// Background job (rotation task is app-controlled; we just expose the class)
import { JwksRotationJob } from './jobs/jwks-rotation.job'

// Adapters
import { RedisTokenAdapter } from './adapters/redis-token.adapter'
import { DbIdentityAdapter } from './adapters/db-identity.adapter'

// OAuth provider adapters
import { GitHubOAuthAdapter } from './services/oauth/github.adapter'
import { GoogleOAuthAdapter } from './services/oauth/google.adapter'
import { DiscordOAuthAdapter } from './services/oauth/discord.adapter'
import { FacebookOAuthAdapter } from './services/oauth/facebook.adapter'

@Module({
  // Note: no forced imports here; keep this lib lightweight.
  // Consumers should import their infra modules (Redis/DB/Schedule/Config) in the app.
  providers: [
    // Core auth services
    TokenService,
    JwksService,
    TotpService,
    WebAuthnService,

    // Guards & strategy (not bound as global guards here; export them)
    JwtStrategy,
    JwtAuthGuard,
    ScopesGuard,
    OrgContextGuard,

    // Background job (consumer decides whether/when ScheduleModule is used)
    JwksRotationJob,

    // Adapters (optional dependencies are handled within each class)
    RedisTokenAdapter,
    DbIdentityAdapter,

    // OAuth providers
    GitHubOAuthAdapter,
    GoogleOAuthAdapter,
    DiscordOAuthAdapter,
    FacebookOAuthAdapter
  ],
  exports: [
    // Re-export everything so feature modules can inject what they need.
    TokenService,
    JwksService,
    TotpService,
    WebAuthnService,

    JwtStrategy,
    JwtAuthGuard,
    ScopesGuard,
    OrgContextGuard,

    JwksRotationJob,

    RedisTokenAdapter,
    DbIdentityAdapter,

    GitHubOAuthAdapter,
    GoogleOAuthAdapter,
    DiscordOAuthAdapter,
    FacebookOAuthAdapter
  ]
})
export class AuthModule {}
