# auth

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test auth` to execute the unit tests via [Jest](https://jestjs.io).

## File Structure

```bash
libs/auth/
├─ project.json
├─ package.json
├─ .eslintrc.json
├─ tsconfig.json
├─ tsconfig.lib.json
├─ tsconfig.spec.json
├─ jest.config.ts
└─ src/
   ├─ index.ts                         # re-exports public API
   └─ lib/
      ├─ auth.module.ts                # imports/exports all auth providers
      ├─ config/
      │  └─ auth.config.ts             # env schema + defaults (JWKS kid, TTLs, issuers)
      ├─ constants/
      │  └─ auth.constants.ts          # header names, claim keys, cookie names, etc.
      ├─ dtos/
      │  ├─ login.dto.ts
      │  ├─ oauth-callback.dto.ts
      │  └─ webauthn.dto.ts
      ├─ types/
      │  ├─ token.types.ts             # Access/Refresh payloads, JWKS types
      │  └─ auth.types.ts              # UserContext, Provider enums, Scope strings
      ├─ decorators/
      │  ├─ scopes.decorator.ts        # @Scopes(...)
      │  └─ org-context.decorator.ts   # pulls org/team from request
      ├─ guards/
      │  ├─ jwt-auth.guard.ts
      │  ├─ scopes.guard.ts
      │  └─ org-context.guard.ts
      ├─ strategies/
      │  └─ jwt.strategy.ts            # if you use Passport; otherwise keep empty
      ├─ controllers/
      │  ├─ jwks.controller.ts         # GET /.well-known/jwks.json
      │  └─ oauth.controller.ts        # optional: provider redirects/callbacks
      ├─ services/
      │  ├─ token.service.ts           # jose-based sign/verify, rotation, reuse checks
      │  ├─ jwks.service.ts            # keypair gen, cache, publish
      │  ├─ totp.service.ts            # otplib enroll/verify + recovery codes
      │  ├─ webauthn.service.ts        # simplewebauthn register/assert
      │  ├─ oauth/
      │  │  ├─ google.adapter.ts
      │  │  ├─ github.adapter.ts
      │  │  ├─ discord.adapter.ts
      │  │  └─ facebook.adapter.ts
      │  └─ helpers/
      │     ├─ claims.helper.ts        # build standard claims, scope -> claims
      │     └─ crypto.helper.ts        # random IDs, base64url, hashing
      ├─ jobs/
      │  └─ jwks-rotation.job.ts       # 90-day rotation (nestjs/schedule)
      ├─ adapters/
      │  ├─ redis-token.adapter.ts     # uses libs/redis for RT families, denylist
      │  └─ db-identity.adapter.ts     # uses libs/db for users/orgs lookups
      └─ testing/
         ├─ token.service.spec.ts
         └─ jwks.service.spec.ts
```

### **Notes**

* `auth.module.ts` wires `ConfigModule`, `ScheduleModule` (for rotation), `RedisModule`, and exports guards/services needed by apps.
* Keep **Passport** optional: if you use pure `jose`, `jwt.strategy.ts` can be omitted.
* `adapters/` isolates cross-lib calls (to `libs/redis` and `libs/db`) so the core services stay clean/testable.
* `controllers/jwks.controller.ts` serves `/.well-known/jwks.json`; `jobs/jwks-rotation.job.ts` refreshes and persists the active keypair.
* `index.ts` should export only what apps need (module, guards, decorators, key services, DTOs/types).
