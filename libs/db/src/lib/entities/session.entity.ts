// libs/db/src/lib/entities/session.entity.ts

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core'
import { randomUUID } from 'node:crypto'

/**
 * Server-side session record.
 * - Distinct from JWTs; useful for tracking login state, device info, and revocation.
 * - Soft revocation via `revokedAt` (prefer this over hard delete for auditability).
 */
@Entity({ tableName: 'session' })
@Index({ properties: ['userId'] })
@Index({ properties: ['orgId'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['expiresAt'] })
@Index({ properties: ['revokedAt'] })
export class Session {
  /** Primary key (UUID). */
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID()

  /** Owning user (UUID, required). */
  @Property({ type: 'uuid' })
  userId!: string

  /** Optional organization context (tenant) for the session. */
  @Property({ type: 'uuid', nullable: true })
  orgId?: string | null

  /** Client-reported User-Agent (truncate generously to avoid index bloat). */
  @Property({ length: 512, nullable: true })
  userAgent?: string | null

  /** Remote IP address (IPv4/IPv6 string). */
  @Property({ length: 64, nullable: true })
  ip?: string | null

  /** Optional metadata (device info, geolocation, risk score, etc.). */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null

  /** Timestamps */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date()

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date

  /** Soft-revocation timestamp. */
  @Property({ nullable: true })
  revokedAt?: Date | null

  /** Optional expiry — null means “until revoked”. */
  @Property({ nullable: true })
  expiresAt?: Date | null

  // ─────────────────────────────── helpers ───────────────────────────────

  /**
   * True if the session is no longer valid (revoked or past expiry).
   * This is computed at runtime and not persisted.
   */
  @Property({ persist: false })
  get active(): boolean {
    if (this.revokedAt) return false
    if (this.expiresAt && this.expiresAt.getTime() <= Date.now()) return false
    return true
  }

  /** Convenience soft-revoke helper. */
  revoke(now = new Date()): void {
    this.revokedAt = now
  }
}
