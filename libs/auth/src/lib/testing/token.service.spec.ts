// libs/auth/src/lib/testing/token.service.spec.ts
// -----------------------------------------------------------------------------
// TokenService tests (scaffold)
// -----------------------------------------------------------------------------
// Why this file?
// - Gives you a clean, typed harness to exercise access/refresh minting,
//   verification, and rotation behavior without hitting real Redis or JWKS.
// - Uses HS256 by default via env to avoid keypair generation in tests.
// - Mocks dependencies with simple fakes you can extend as you implement features.
//
// How to use:
// 1) Remove `describe.skip` once TokenService is wired.
// 2) If your TokenService constructor or method names differ, adjust the mocks
//    and calls below (kept very "any"-friendly to reduce friction).
// 3) If you rely on RSA/EdDSA, swap to a JWKS mock that returns a signer/verifier
//    pair based on jose imported keys, or just keep HS for unit-level tests.
// -----------------------------------------------------------------------------

import 'jest'
import { randomUUID } from 'node:crypto'

// NOTE: keep imports relative to this lib so TS project references work
import { TokenService } from '../services/token.service'

// If you export config types/utilities, import them here.
// The test uses a minimal inline shape to avoid coupling.
type ResolvedAuthConfig = {
  algorithm: string
  issuer: string
  audience: string
  audiences: string[]
  clockSkewSeconds: number
  accessTtlSeconds: number
  refreshTtlSeconds: number
  refreshFamilyTtlSeconds: number
  cookies: {
    domain?: string
    secure: boolean
    sameSite: 'lax' | 'strict' | 'none'
    accessName: string
    refreshName: string
    refreshMaxAge: number
    csrfName: string
    csrfHttpOnly: boolean
  }
  jwks: {
    wellKnownPath: string
    modulusLength: 2048 | 3072 | 4096
    rotationDays: number
    baseUrl?: string
    kid?: string
  }
}

// ------------------------------- Test doubles -------------------------------

// Super-simple audit mock that just collects events (never throws)
const makeAuditMock = () => {
  const events: Array<{ name: string; data?: unknown }> = []
  return {
    events,
    emit: jest.fn((name: string, data?: unknown) => {
      events.push({ name, data })
    }),
    record: jest.fn((name: string, data?: unknown) => {
      events.push({ name, data })
    }),
    log: jest.fn((name: string, data?: unknown) => {
      events.push({ name, data })
    })
  }
}

// In-memory token/jti family & denylist store (subset used by TokenService)
const makeRedisTokenAdapterMock = () => {
  const deny = new Set<string>() // jti denylist
  const families = new Map<string, Set<string>>() // familyId -> set of jtis

  return {
    // store family membership (familyId groups refresh tokens across rotations)
    addToFamily: jest.fn(async (familyId: string, jti: string) => {
      if (!families.has(familyId)) families.set(familyId, new Set())
      families.get(familyId)!.add(jti)
    }),
    isDenied: jest.fn(async (jti: string) => deny.has(jti)),
    denyJti: jest.fn(async (jti: string) => {
      deny.add(jti)
      return true
    }),
    // optional helpers your service might use
    familySize: () => families.size,
    clear: () => {
      deny.clear()
      families.clear()
    }
  }
}

// JWKS mock for tests. For HS* flows your TokenService should bypass JWKS,
// but we provide a shape that won’t explode if it calls into it.
const makeJwksMock = () => ({
  // no-ops for HS; extend if you need RSA/EdDSA in tests
  getPublicJwks: jest.fn(async () => ({ keys: [] })),
  rotateIfNeeded: jest.fn(async () => false),
  // If your TokenService requests a signer/verifier, return pass-through fns.
  // (Adjust to your actual TokenService contract if needed.)
  getSigner: jest.fn(async () => async (header: any, payload: any) => {
    // Return a minimal JWT-ish string for debugging (NOT cryptographically real)
    return (
      Buffer.from(JSON.stringify({ header, payload })).toString('base64url') +
      '.sig'
    )
  }),
  getVerifier: jest.fn(async () => async (jwt: string) => {
    // Reverse the above "encoding" to simulate verification
    const [b64] = jwt.split('.')
    const { payload } = JSON.parse(
      Buffer.from(b64, 'base64url').toString('utf8')
    )
    return payload
  })
})

// ------------------------------- Test config --------------------------------

const makeConfig = (
  overrides: Partial<ResolvedAuthConfig> = {}
): ResolvedAuthConfig => ({
  algorithm: 'HS256',
  issuer: 'https://auth.helix.local',
  audience: 'helix-api',
  audiences: ['helix-api'],
  clockSkewSeconds: 30,
  accessTtlSeconds: 15 * 60, // 15m
  refreshTtlSeconds: 30 * 24 * 60 * 60, // 30d
  refreshFamilyTtlSeconds: 45 * 24 * 60 * 60, // 45d
  cookies: {
    domain: 'localhost',
    secure: false,
    sameSite: 'lax',
    accessName: 'acc',
    refreshName: 'ref',
    refreshMaxAge: 30 * 24 * 60 * 60,
    csrfName: 'csrf',
    csrfHttpOnly: false
  },
  jwks: {
    wellKnownPath: '/.well-known/jwks.json',
    modulusLength: 2048,
    rotationDays: 90
  },
  ...overrides
})

// For HS*, ensure the secret exists in env (TokenService may read it)
const setHsSecret = (value = 'test-secret-please-change') => {
  process.env.AUTH_JWT_SECRET = value
  process.env.JWT_SECRET = value
}

// -----------------------------------------------------------------------------
// Test suite
// -----------------------------------------------------------------------------

describe.skip('TokenService (scaffold)', () => {
  let service: TokenService
  const jwks = makeJwksMock()
  const redisAdapter = makeRedisTokenAdapterMock()
  const audit = makeAuditMock()

  beforeAll(() => {
    setHsSecret()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    redisAdapter.clear()

    const cfg = makeConfig()
    // NOTE:
    // If your TokenService uses Nest injection tokens, swap this for a
    // TestingModule that provides those tokens. To keep this scaffold broadly
    // compatible, we new-up the service using `as any` to avoid ctor signature
    // mismatch while you iterate on the class.
    service = new (TokenService as any)(cfg, jwks, redisAdapter, audit)
  })

  it('mints and verifies an ACCESS token (round-trip)', async () => {
    const subject = `user:${randomUUID()}`
    const orgId = randomUUID()
    const scopes = ['users.read', 'teams.read']

    // Mint (your actual method may include different names/shape)
    const jwt: any = await (service as any).mintAccess({
      subject,
      orgId,
      scopes,
      sessionId: randomUUID()
    })

    expect(typeof jwt === 'string' || typeof jwt?.token === 'string').toBe(true)

    // Verify
    const tokenString = typeof jwt === 'string' ? jwt : jwt.token
    const verified: any = await (service as any).verifyAccess(tokenString)

    // Minimal assertions that should hold in your implementation
    expect(verified).toBeTruthy()
    expect(verified.typ ?? verified.payload?.typ).toBe('access')
    expect(verified.sub ?? verified.payload?.sub).toBe(subject)
    if ('org' in verified || verified?.payload?.org) {
      expect(verified.org ?? verified.payload?.org).toBe(orgId)
    }
  })

  it('mints and verifies a REFRESH token (round-trip)', async () => {
    const subject = `user:${randomUUID()}`
    const familyId = randomUUID()
    const sessionId = randomUUID()

    const rt: any = await (service as any).mintRefresh({
      subject,
      sessionId,
      familyId
    })

    const tokenString = typeof rt === 'string' ? rt : rt.token
    const verified: any = await (service as any).verifyRefresh(tokenString)

    expect(verified).toBeTruthy()
    expect(verified.typ ?? verified.payload?.typ).toBe('refresh')
    expect(verified.sub ?? verified.payload?.sub).toBe(subject)
  })

  it('denylists a refresh JTI (reuse detection path)', async () => {
    const subject = `user:${randomUUID()}`
    const familyId = randomUUID()
    const sessionId = randomUUID()

    const rt: any = await (service as any).mintRefresh({
      subject,
      sessionId,
      familyId
    })

    const tokenString = typeof rt === 'string' ? rt : rt.token
    const parsed: any = await (service as any).decode(tokenString) // or a helper you expose

    // Simulate server marking this jti as used (reuse-protection)
    await (redisAdapter as any).denyJti(parsed.jti)

    // On verify, your service should reject or flag reuse
    await expect(
      (service as any).verifyRefresh(tokenString)
    ).rejects.toBeTruthy()
  })
})
