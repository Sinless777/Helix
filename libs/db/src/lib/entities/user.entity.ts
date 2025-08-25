import { Entity, PrimaryKey, Property, Unique, Index } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

@Entity({ tableName: 'user' })
@Unique({ properties: ['emailLower'] })
@Index({ properties: ['emailVerified'] })
@Index({ properties: ['phoneE164'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['lastLoginAt'] })
@Index({ properties: ['lockedUntil'] })
@Index({ properties: ['disabledAt'] })
@Index({ properties: ['deletedAt'] })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  // ── Identity / Contact ────────────────────────────────────────────────

  /** User-facing email (original casing preserved for display). */
  @Property({ length: 320 })
  email!: string;

  /** Lowercased email for case-insensitive lookups & uniqueness. */
  @Property({ length: 320 })
  emailLower!: string;

  /** Whether the user verified this email. */
  @Property({ default: false })
  emailVerified: boolean = false;

  @Property({ nullable: true })
  emailVerifiedAt?: Date | null;

  /** Optional phone for SMS MFA / notifications (E.164). */
  @Property({ length: 32, nullable: true })
  phoneE164?: string | null;

  @Property({ default: false })
  phoneVerified: boolean = false;

  @Property({ nullable: true })
  phoneVerifiedAt?: Date | null;

  // ── Auth (password) ───────────────────────────────────────────────────

  /**
   * Argon2id (recommended) hash; may be null for OAuth-only accounts.
   * Example format: "argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>"
   */
  @Property({ hidden: true, nullable: true })
  passwordHash?: string | null;

  /** Version for the password hashing params/envelope. */
  @Property({ type: 'smallint', default: 1 })
  passwordVersion: number = 1;

  @Property({ nullable: true })
  passwordUpdatedAt?: Date | null;

  // ── MFA flags (cache; source of truth may live in factor tables) ───────

  @Property({ default: false })
  mfaTotpEnabled: boolean = false;

  @Property({ default: false })
  mfaSmsEnabled: boolean = false;

  @Property({ default: false })
  mfaWebAuthnEnabled: boolean = false;

  // ── Account state / risk ──────────────────────────────────────────────

  @Property({ type: 'int', default: 0 })
  failedLoginAttempts: number = 0;

  /** If set, user cannot sign in until this time. */
  @Property({ nullable: true })
  lockedUntil?: Date | null;

  /** Administrative disable. */
  @Property({ nullable: true })
  disabledAt?: Date | null;

  /** Soft-delete (GDPR/cleanup friendly). */
  @Property({ nullable: true })
  deletedAt?: Date | null;

  // ── Usage / analytics ─────────────────────────────────────────────────

  @Property({ nullable: true })
  lastLoginAt?: Date | null;

  @Property({ nullable: true })
  lastSeenAt?: Date | null;

  /**
   * Total successful sign-ins.
   * Cockroach BIGINT → map to string in TS to avoid precision loss.
   */
  @Property({
    type: 'bigint',
    nullable: true,
    serializer: (v: any) => (v == null ? null : v.toString()),
  })
  signInCount?: string | null;

  // ── Features / Metadata ───────────────────────────────────────────────

  /** Global/system roles (e.g., "superadmin"); org/team roles live in membership tables. */
  @Property({ type: 'text[]', nullable: true })
  systemRoles?: string[] | null;

  /** Feature flags directly on user (rare; usually at org/team). */
  @Property({ type: 'text[]', nullable: true })
  featureFlags?: string[] | null;

  /** Free-form metadata (provisioner, notes, import IDs, etc.). */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  // ── Timestamps ────────────────────────────────────────────────────────

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  // ── Derived flags (not persisted) ─────────────────────────────────────

  @Property({ persist: false })
  get isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil.getTime() > Date.now());
  }

  @Property({ persist: false })
  get isDisabled(): boolean {
    return !!this.disabledAt;
  }

  @Property({ persist: false })
  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  @Property({ persist: false })
  get isActive(): boolean {
    return !this.isDeleted && !this.isDisabled && !this.isLocked;
  }

  @Property({ persist: false })
  get mfaEnabled(): boolean {
    return this.mfaTotpEnabled || this.mfaSmsEnabled || this.mfaWebAuthnEnabled;
  }

  // ── Domain helpers ────────────────────────────────────────────────────

  /** Set email and normalized email; resets verification state. */
  setEmail(email: string): void {
    const e = String(email).trim();
    this.email = e;
    this.emailLower = e.toLowerCase();
    this.emailVerified = false;
    this.emailVerifiedAt = null;
  }

  /** Mark email verified. */
  markEmailVerified(when: Date = new Date()): void {
    this.emailVerified = true;
    this.emailVerifiedAt = when;
  }

  /** Update password hash & metadata (increment version if you changed params). */
  setPasswordHash(hash: string, version?: number, when: Date = new Date()): void {
    this.passwordHash = hash;
    this.passwordVersion = version ?? this.passwordVersion;
    this.passwordUpdatedAt = when;
  }

  /** Record a successful sign-in, reset failures/lock, bump counters. */
  markLoginSuccess(when: Date = new Date()): void {
    this.lastLoginAt = when;
    this.lastSeenAt = when;
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    const n = this.signInCount ? BigInt(this.signInCount) : 0n;
    this.signInCount = (n + 1n).toString();
  }

  /**
   * Record a failed sign-in attempt and (optionally) set lockout with exponential backoff.
   * Backoff starts after 3 failures by default.
   */
  markLoginFailure(
    when: Date = new Date(),
    baseLockSeconds = 10,
    maxLockSeconds = 15 * 60,
  ): void {
    this.failedLoginAttempts += 1;
    const backoff = Math.min(
      baseLockSeconds * 2 ** Math.max(0, this.failedLoginAttempts - 3),
      maxLockSeconds,
    );
    if (backoff > 0) {
      const from = Math.max(this.lockedUntil?.getTime() ?? 0, when.getTime());
      this.lockedUntil = new Date(from + backoff * 1000);
    }
  }

  /** Update last seen timestamp (e.g., on authenticated API hit). */
  touchSeen(when: Date = new Date()): void {
    this.lastSeenAt = when;
  }

  /** Enable/disable cached MFA flags. (Actual factor records live in their own tables.) */
  setMfaFlags(flags: { totp?: boolean; sms?: boolean; webauthn?: boolean }): void {
    const { totp, sms, webauthn } = flags;
    if (typeof totp === 'boolean') this.mfaTotpEnabled = totp;
    if (typeof sms === 'boolean') this.mfaSmsEnabled = sms;
    if (typeof webauthn === 'boolean') this.mfaWebAuthnEnabled = webauthn;
  }

  /** Soft-delete this user. */
  softDelete(when: Date = new Date()): void {
    this.deletedAt = when;
  }

  /** Disable or re-enable account. */
  setDisabled(disabled: boolean, when: Date = new Date()): void {
    this.disabledAt = disabled ? when : null;
  }
}
