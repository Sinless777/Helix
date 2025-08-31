import { Entity, PrimaryKey, Property, Unique, Index } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

export type DeviceGeo = {
  country?: string;     // e.g., "US"
  region?: string;      // e.g., "CA"
  city?: string;        // e.g., "San Francisco"
  timezone?: string;    // e.g., "America/Los_Angeles"
  lat?: number;
  lon?: number;
};

export type ClientHints = {
  platform?: string;          // e.g., "Windows", "iOS", "Android"
  platformVersion?: string;
  architecture?: string;      // e.g., "arm", "x86"
  model?: string;             // device model (mobile)
  brands?: Array<{ brand: string; version: string }>;
  mobile?: boolean;
};

/**
 * TrustedDevice — “remember this device” record to reduce MFA prompts for a user.
 * Persisted per-user (optionally per-org), with fingerprint hash and optional
 * device-bound key hash. You can set `mfaBypassUntil` to skip MFA until that time.
 */
@Entity({ tableName: 'trusted_device' })
@Unique({ properties: ['userId', 'fingerprintHash'] })
@Unique({ properties: ['userId', 'deviceKeyHash'], options: { partialFilterExpression: { deviceKeyHash: { $ne: null } } } as any })
@Index({ properties: ['userId'] })
@Index({ properties: ['orgId'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['lastSeenAt'] })
@Index({ properties: ['mfaBypassUntil'] })
export class TrustedDevice {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Owning user. */
  @Property({ type: 'uuid' })
  userId!: string;

  /** Optional org/tenant (if trust should be scoped). */
  @Property({ type: 'uuid', nullable: true })
  orgId?: string | null;

  /**
   * Stable device fingerprint HASH (e.g., sha256 of concatenated client hints/UA + device key id).
   * Never store raw fingerprint. Keep only a fixed-length hash.
   */
  @Property()
  fingerprintHash!: string;

  /**
   * Optional device-bound key hash (e.g., hash of a device secret or WebAuthn credential id).
   * Lets you strongly bind trust to a specific hardware key or passkey.
   */
  @Property({ nullable: true })
  deviceKeyHash?: string | null;

  /** Friendly label shown in UI (e.g., "Chrome on Windows", "iPhone 15"). */
  @Property()
  label!: string;

  /** User-Agent string (for display/forensics). */
  @Property({ nullable: true })
  userAgent?: string | null;

  /** Client Hints captured at creation time (for display/forensics). */
  @Property({ type: 'json', nullable: true })
  clientHints?: ClientHints | null;

  /** Tags like "desktop", "mobile", "work-laptop", etc. */
  @Property({ type: 'text[]', nullable: true })
  tags?: string[] | null;

  /** First and last observed IPs. */
  @Property({ nullable: true })
  ipFirst?: string | null;

  @Property({ nullable: true })
  ipLast?: string | null;

  /** First and last geo lookups (coarse, for forensics). */
  @Property({ type: 'json', nullable: true })
  geoFirst?: DeviceGeo | null;

  @Property({ type: 'json', nullable: true })
  geoLast?: DeviceGeo | null;

  /** When the user approved “remember this device”. */
  @Property({ nullable: true })
  approvedAt?: Date | null;

  /** When trust expires naturally (server policy), if any. */
  @Property({ nullable: true })
  expiresAt?: Date | null;

  /** When the user/admin revoked this device trust. */
  @Property({ nullable: true })
  revokedAt?: Date | null;

  /** When this device last appeared successfully (post-auth). */
  @Property({ nullable: true })
  lastSeenAt?: Date | null;

  /**
   * Skip MFA challenges until this time (rolling or fixed window).
   * Set/update this when the user opts to “remember” device after a successful MFA.
   */
  @Property({ nullable: true })
  mfaBypassUntil?: Date | null;

  /** Risk & abuse signals */
  @Property({ type: 'int', default: 0 })
  failedMfaAttempts: number = 0;

  @Property({ type: 'int', default: 0 })
  riskScore: number = 0;

  @Property({ type: 'json', nullable: true })
  riskNotes?: Record<string, unknown> | null;

  /** Free-form metadata */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  /** Timestamps */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  // ─────────────────────────── Derived helpers (not persisted) ───────────────────────────

  @Property({ persist: false })
  get isExpired(): boolean {
    return !!(this.expiresAt && this.expiresAt.getTime() <= Date.now());
  }

  @Property({ persist: false })
  get isRevoked(): boolean {
    return !!this.revokedAt;
  }

  @Property({ persist: false })
  get isActive(): boolean {
    return !this.isRevoked && !this.isExpired;
  }

  @Property({ persist: false })
  get isRemembered(): boolean {
    return !!(this.mfaBypassUntil && this.mfaBypassUntil.getTime() > Date.now());
  }

  // ─────────────────────────── Domain helpers ───────────────────────────

  /** Mark device as seen; update IP/geo and lastSeenAt. */
  markSeen(ip?: string | null, geo?: DeviceGeo | null, when = new Date()): void {
    if (!this.ipFirst && ip) this.ipFirst = ip;
    if (!this.geoFirst && geo) this.geoFirst = geo ?? null;
    if (ip) this.ipLast = ip;
    if (geo) this.geoLast = geo;
    this.lastSeenAt = when;
  }

  /** Mark a successful MFA on this device and optionally extend bypass. */
  markMfaSuccess(extendBypassMs?: number, now = new Date()): void {
    this.failedMfaAttempts = 0;
    if (extendBypassMs && extendBypassMs > 0) {
      const from = Math.max(this.mfaBypassUntil?.getTime() ?? 0, now.getTime());
      this.mfaBypassUntil = new Date(from + extendBypassMs);
    }
  }

  /** Record a failed MFA for rate limiting/risk. */
  markMfaFailure(now = new Date()): void {
    this.failedMfaAttempts += 1;
    this.lastSeenAt = now;
  }

  /** Revoke this device trust immediately. */
  revoke(when = new Date()): void {
    this.revokedAt = when;
  }
}
