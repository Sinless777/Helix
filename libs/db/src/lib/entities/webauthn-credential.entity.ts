import { Entity, PrimaryKey, Property, Enum, Unique, Index } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';

/** WebAuthn Authenticator Transports (per spec). */
export enum WebAuthnTransport {
  usb = 'usb',
  nfc = 'nfc',
  ble = 'ble',
  internal = 'internal',
  hybrid = 'hybrid',
}

/** Attachment hint (not guaranteed by every lib, but useful to store). */
export enum AuthenticatorAttachment {
  platform = 'platform',
  cross_platform = 'cross-platform',
}

/**
 * WebAuthnCredential
 * - `credentialId`: the Base64URL-encoded credential ID (unique).
 * - `publicKeyCose`: Base64URL-encoded COSE public key (raw bytes → b64url string).
 * - Store only non-sensitive metadata. No private keys are ever stored.
 */
@Entity({ tableName: 'webauthn_credential' })
@Unique({ properties: ['credentialId'] })
@Unique({ properties: ['userId', 'label'] })
@Unique({ properties: ['userId', 'credentialId'] }) // redundancy for fast lookups
@Index({ properties: ['userId'] })
@Index({ properties: ['rpId'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['lastUsedAt'] })
export class WebAuthnCredential {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  /** Owning user */
  @Property({ type: 'uuid' })
  userId!: string;

  /** Relying Party ID (usually your effective domain, e.g., "helixaibot.com"). */
  @Property()
  rpId!: string;

  /** Optional human-friendly label (e.g., "MacBook Pro", "iPhone Passkey"). */
  @Property()
  label!: string;

  /**
   * Base64URL-encoded credential ID (raw ArrayBuffer → b64url).
   * Keep globally unique so you can resolve credential → user efficiently.
   */
  @Property({ length: 512 })
  credentialId!: string;

  /**
   * Base64URL-encoded COSE public key (raw ArrayBuffer → b64url).
   * You’ll use this to verify assertions (library-specific decode at runtime).
   */
  @Property({ hidden: true })
  publicKeyCose!: string;

  /** Authenticator AAGUID (UUID), if the attestation/assertion provided it. */
  @Property({ nullable: true })
  aaguid?: string | null;

  /** Transports supported by the authenticator (usb/nfc/ble/internal/hybrid). */
  @Enum({ items: () => WebAuthnTransport, array: true, type: 'string', nullable: true })
  transports?: WebAuthnTransport[] | null;

  /** Attachment hint (platform vs cross-platform) if available. */
  @Enum({ items: () => AuthenticatorAttachment, type: 'string', nullable: true })
  attachment?: AuthenticatorAttachment | null;

  /**
   * Whether this credential is a "discoverable/resident" credential (RK).
   * Helpful when deciding if username-less flows are possible.
   */
  @Property({ default: false })
  discoverable: boolean = false;

  /**
   * Signals per WebAuthn L2:
   * - backupEligible: authenticator can be backed up (e.g., iCloud/Google synced passkeys)
   * - backupState: whether this specific credential is currently backed up
   */
  @Property({ default: false })
  backupEligible: boolean = false;

  @Property({ default: false })
  backupState: boolean = false;

  /** User verification policy at registration time (informational). */
  @Property({ nullable: true })
  userVerification?: 'required' | 'preferred' | 'discouraged' | null;

  /** Attestation info captured at registration (optional, for forensics/compliance). */
  @Property({ nullable: true })
  attestationFormat?: string | null;

  /** Trust path attestation artifacts (cert paths, ECDAA, metadata references). */
  @Property({ type: 'json', nullable: true })
  attestationTrustPath?: Record<string, unknown> | null;

  /**
   * Allowed origins (scheme+host[:port]) if you want to pin where this credential may be used
   * (useful in multi-origin setups). Leave null to allow any valid origin for rpId.
   */
  @Property({ type: 'text[]', nullable: true })
  originAllowlist?: string[] | null;

  /** Sign counter from assertions. Use INT (fits 32-bit). */
  @Property({ type: 'int', default: 0 })
  signCount: number = 0;

  /** Last successful authentication timestamp via this credential. */
  @Property({ nullable: true })
  lastUsedAt?: Date | null;

  /** Lifecycle */
  @Property({ nullable: true })
  revokedAt?: Date | null;

  /** Arbitrary metadata (debug fields, import sources, device info, etc.). */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  /** Housekeeping */
  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true, onUpdate: () => new Date() })
  updatedAt?: Date;

  // ─────────────────────────── Derived flags (not persisted) ───────────────────────────

  @Property({ persist: false })
  get isRevoked(): boolean {
    return !!this.revokedAt;
  }

  @Property({ persist: false })
  get isActive(): boolean {
    return !this.isRevoked;
  }

  // ─────────────────────────── Domain helpers ───────────────────────────

  /** Mark a successful authentication; bump sign counter and lastUsedAt. */
  markAssertionSuccess(newSignCount: number | undefined, when: Date = new Date()): void {
    if (typeof newSignCount === 'number' && Number.isFinite(newSignCount)) {
      // Only update if monotonic (some authenticators may reset; guard accordingly).
      if (newSignCount >= this.signCount) {
        this.signCount = newSignCount;
      }
    }
    this.lastUsedAt = when;
  }

  /** Revoke this credential (e.g., device lost); prevents future auth. */
  revoke(when: Date = new Date()): void {
    this.revokedAt = when;
  }

  /** Convenience for updating transports (replace entire set). */
  setTransports(t: Array<WebAuthnTransport | string> | null | undefined): void {
    this.transports = t?.map((x) => String(x).toLowerCase() as WebAuthnTransport) ?? null;
  }
}

/*
Migration notes (Cockroach/Postgres):

-- Helpful indexes & constraints are declared via decorators.
-- If you want to store raw bytes instead of Base64URL strings, change:
--   publicKeyCose: { type: 'bytea' } and keep TS type Buffer | Uint8Array
--   credentialId:  { type: 'bytea' } UNIQUE
-- but Base64URL strings are simpler to log/debug/migrate.

-- If you plan to query into attestationTrustPath JSON, consider an inverted index:
--   CREATE INVERTED INDEX IF NOT EXISTS idx_webauthn_attest ON webauthn_credential (attestationTrustPath);
*/
