import { Entity, PrimaryKey, Property, Enum, Index, Unique } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

export enum TotpAlgorithm {
  SHA1 = 'SHA1',
  SHA256 = 'SHA256',
  SHA512 = 'SHA512',
}

/**
 * Per-user TOTP configuration.
 * - Store secrets ENCRYPTED (not plaintext/base32). Use your KMS/libsodium and set `secretEnc`.
 * - Recovery codes should be hashed (e.g., sha256/argon2) before storing in `recoveryCodesHash`.
 */
@Entity({ tableName: 'mfa_totp' })
@Index({ properties: ['userId'] })
@Index({ properties: ['enabled'] })
@Index({ properties: ['createdAt'] })
@Unique({ properties: ['userId', 'label'] }) // a user can't have duplicate labels
export class MfaTotp {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Owning user */
  @Property({ type: 'uuid' })
  userId!: string;

  /** Display label the user/admin chose, e.g., "iPhone", "YubiKey OTP", "Default" */
  @Property()
  label!: string;

  /** Issuer shown to authenticator apps (defaults to your product name) */
  @Property({ default: 'Helix AI' })
  issuer: string = 'Helix AI';

  /**
   * Encrypted TOTP secret (binary → base64url or hex). Do NOT store plaintext.
   * You control the crypto (KMS, libsodium, etc.). Include versioning for future rotations.
   */
  @Property({ hidden: true })
  secretEnc!: string;

  /** Version of the secret envelope/format (for future migrations/rotations) */
  @Property({ type: 'smallint', default: 1 })
  secretVersion: number = 1;

  /** RFC6238 parameters */
  @Enum({ items: () => TotpAlgorithm, type: 'string' })
  algorithm: TotpAlgorithm = TotpAlgorithm.SHA1;

  @Property({ type: 'smallint', default: 6 })
  digits: number = 6;

  @Property({ type: 'smallint', default: 30 })
  period: number = 30; // seconds

  /**
   * Server-side drift adjustment (seconds). Positive means accept codes slightly in the future.
   * Keep small; verification should still consider a +/- window at runtime.
   */
  @Property({ type: 'int', default: 0 })
  driftSeconds: number = 0;

  /**
   * Recovery codes (hashes). When a code is used, remove its hash from this array and
   * optionally append to `usedRecoveryCodesHash` for auditing.
   */
  @Property({ type: 'text[]', nullable: true })
  recoveryCodesHash?: string[] | null;

  /** (Optional) Historical list of used recovery code hashes for audit */
  @Property({ type: 'text[]', nullable: true })
  usedRecoveryCodesHash?: string[] | null;

  /** Enabled after successful verification of at least one TOTP code */
  @Property({ default: false })
  enabled: boolean = false;

  /** When the user first verified a TOTP code for this factor */
  @Property({ nullable: true })
  verifiedAt?: Date | null;

  /** Rate-limit / lockout support */
  @Property({ type: 'int', default: 0 })
  failedAttempts: number = 0;

  @Property({ nullable: true })
  lockedUntil?: Date | null;

  /** Usage signals */
  @Property({ nullable: true })
  lastUsedAt?: Date | null;

  /** Housekeeping */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  // ─────────────────────────── Derived helpers (not persisted) ───────────────────────────

  @Property({ persist: false })
  get isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil.getTime() > Date.now());
  }

  // ─────────────────────────── Domain helpers ───────────────────────────

  /**
   * Consume a recovery code by its plaintext representation.
   * You must pass a `hashFn` compatible with how you originally hashed the codes.
   * Returns true if a code was matched and removed.
   */
  consumeRecoveryCode(plain: string, hashFn: (s: string) => string): boolean {
    if (!plain || !this.recoveryCodesHash?.length) return false;
    const h = hashFn(plain);
    const idx = this.recoveryCodesHash.indexOf(h);
    if (idx === -1) return false;

    // Remove from active set
    this.recoveryCodesHash.splice(idx, 1);

    // Track as used (optional)
    if (!this.usedRecoveryCodesHash) this.usedRecoveryCodesHash = [];
    this.usedRecoveryCodesHash.push(h);

    return true;
  }

  /** Mark a successful verification (resets failures, sets lastUsedAt). */
  markSuccess(now = new Date()): void {
    this.failedAttempts = 0;
    this.lockedUntil = null;
    this.lastUsedAt = now;
    if (!this.enabled) {
      this.enabled = true;
      this.verifiedAt = now;
    }
  }

  /** Mark a failed verification and apply an exponential backoff lock if desired. */
  markFailure(now = new Date(), baseLockSeconds = 5, maxLockSeconds = 300): void {
    this.failedAttempts += 1;
    const backoff = Math.min(baseLockSeconds * 2 ** Math.max(0, this.failedAttempts - 3), maxLockSeconds);
    if (backoff > 0) {
      this.lockedUntil = new Date(now.getTime() + backoff * 1000);
    }
  }
}
