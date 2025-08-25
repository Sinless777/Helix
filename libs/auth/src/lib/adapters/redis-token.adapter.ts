// libs/auth/src/lib/adapters/redis-token.adapter.ts
// -----------------------------------------------------------------------------
// Redis-backed token store for auth flows
// -----------------------------------------------------------------------------
// What this file provides
//   • A small interface (TokenStoreAdapter) for token-related persistence
//   • A Redis implementation (RedisTokenAdapter) using your @helixai/redis lib
// Why depend on @helixai/redis?
//   • Reuse its DI + connection (no duplicate ioredis clients)
//   • Reuse its JSON helpers & TTL handling via CacheRepository
//   • Keep consistent namespacing and observability across the codebase

import { Injectable, Optional } from '@nestjs/common'

// 👇 Replace the import path with whatever your workspace export is.
// If your barrel exports CacheRepository at '@helixai/redis', keep this.
// Otherwise use the relative path like: '../../../../../redis/src/lib/...'
import { Seconds, CacheRepository } from '@helixai/redis' // or wherever you export this type
import { redisKeys } from '../constants/auth.constants'

/* -----------------------------------------------------------------------------
 * Stored JSON shapes
 * -------------------------------------------------------------------------- */

/**
 * Refresh "family" metadata stored at:
 *   rt:family:{sub}:{sid}
 *
 * Notes
 *  - `activeRid` and `activeJti` help detect reuse & lineage
 *  - Timestamps are ISO strings for readability (OK in Redis JSON)
 */
export interface RefreshFamilyState {
  sub: string // subject (user id)
  sid: string // session id (binds RT family to a session)
  activeRid?: string // current refresh token id (rid)
  activeJti?: string // current token jti (if you separate jti/rid)
  createdAt: string // ISO timestamp
  lastRotatedAt?: string // ISO timestamp
  revoked?: boolean
  meta?: Record<string, unknown> // optional extra data
}

/* -----------------------------------------------------------------------------
 * Adapter contract
 * -------------------------------------------------------------------------- */

export interface TokenStoreAdapter {
  // ---- JWT denylist (by jti) ----------------------------------------------
  denylistJwt(jti: string, ttlSeconds: Seconds): Promise<void>
  isJwtDenied(jti: string): Promise<boolean>

  // ---- Refresh token family -----------------------------------------------
  putRefreshFamily(
    sub: string,
    sid: string,
    state: RefreshFamilyState,
    ttlSeconds: Seconds
  ): Promise<void>

  getRefreshFamily(sub: string, sid: string): Promise<RefreshFamilyState | null>

  // Index rid -> (sub,sid) so we can resolve a family from a lone RT quickly
  indexRefreshRid(
    rid: string,
    sub: string,
    sid: string,
    ttlSeconds: Seconds
  ): Promise<void>

  resolveFamilyByRid(rid: string): Promise<{ sub: string; sid: string } | null>

  // Housekeeping
  deleteRefreshFamily(sub: string, sid: string): Promise<void>
  deleteRidIndex(rid: string): Promise<void>
}

/* -----------------------------------------------------------------------------
 * Redis implementation using CacheRepository (from @helixai/redis)
 * -------------------------------------------------------------------------- */

@Injectable()
export class RedisTokenAdapter implements TokenStoreAdapter {
  constructor(
    // CacheRepository wraps your Redis client with friendly helpers:
    //   get/set/del/exists, JSON helpers, mget/mset, expire, etc.
    @Optional() private readonly cache?: CacheRepository
  ) {}

  // ------------------------------ JWT denylist ------------------------------

  /**
   * Put a JWT jti on the denylist for a TTL (seconds).
   * Key: jwt:deny:{jti} -> "1"
   */
  async denylistJwt(jti: string, ttlSeconds: Seconds): Promise<void> {
    if (!this.cache) return
    await this.cache.set(redisKeys.jwtDeny(jti), '1', ttlSeconds)
  }

  /** Check if a jti is denylisted. */
  async isJwtDenied(jti: string): Promise<boolean> {
    if (!this.cache) return false
    return this.cache.exists(redisKeys.jwtDeny(jti))
  }

  // -------------------------- Refresh families -----------------------------

  /**
   * Upsert the refresh family state under a namespaced JSON key.
   * Key: rt:family:{sub}:{sid} -> JSON(RefreshFamilyState)
   */
  async putRefreshFamily(
    sub: string,
    sid: string,
    state: RefreshFamilyState,
    ttlSeconds: Seconds
  ): Promise<void> {
    if (!this.cache) return
    const key = redisKeys.rtFamily(sub, sid)
    await this.cache.setJSON(key, state, ttlSeconds)
  }

  /** Get the refresh family state. */
  async getRefreshFamily(
    sub: string,
    sid: string
  ): Promise<RefreshFamilyState | null> {
    if (!this.cache) return null
    return this.cache.getJSON<RefreshFamilyState>(redisKeys.rtFamily(sub, sid))
  }

  /**
   * Maintain a reverse index to resolve a family from a single rid.
   * Key: rt:index:{rid} -> "sub:sid"
   */
  async indexRefreshRid(
    rid: string,
    sub: string,
    sid: string,
    ttlSeconds: Seconds
  ): Promise<void> {
    if (!this.cache) return
    const key = redisKeys.rtIndex(rid)
    await this.cache.set(key, `${sub}:${sid}`, ttlSeconds)
  }

  /**
   * Resolve (sub,sid) given a refresh token id (rid).
   * Reads "sub:sid" from rt:index:{rid}.
   */
  async resolveFamilyByRid(
    rid: string
  ): Promise<{ sub: string; sid: string } | null> {
    if (!this.cache) return null
    const raw = await this.cache.get(redisKeys.rtIndex(rid))
    if (!raw) return null
    const [sub, sid] = raw.split(':', 2)
    if (!sub || !sid) return null
    return { sub, sid }
  }

  // ------------------------------- Cleanup ----------------------------------

  async deleteRefreshFamily(sub: string, sid: string): Promise<void> {
    if (!this.cache) return
    await this.cache.del(redisKeys.rtFamily(sub, sid))
  }

  async deleteRidIndex(rid: string): Promise<void> {
    if (!this.cache) return
    await this.cache.del(redisKeys.rtIndex(rid))
  }
}

/* -----------------------------------------------------------------------------
 * Notes / wiring
 * -------------------------------------------------------------------------- *
 * 1) Prefer injecting CacheRepository from @helixai/redis. If you don’t have
 *    a provider yet, export it from that lib’s module and import the module
 *    here (AuthModule).
 *
 * 2) If you need raw commands (pipelines, SCAN), you can switch to injecting
 *    the low-level RedisClient from @helixai/redis (via REDIS_CLIENT) and
 *    reimplement the few methods above. CacheRepository covers common needs.
 *
 * 3) Keys are generated via `redisKeys` from your auth constants to keep
 *    namespaces consistent with the rest of the system.
 */
