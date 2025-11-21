// e.g. packages/types/src/crypto.ts

export interface EncryptedPayload {
  /** Version so we can migrate formats later */
  version: 1;

  /** Symmetric cipher in use */
  algorithm: 'aes-256-gcm';

  /** KDF used to derive 32-byte keys from secrets */
  kdf: 'scrypt';

  /** Number of symmetric encryption layers applied */
  layers: 2;

  /**
   * Final, outer ciphertext (layer 2), base64 encoded.
   * This is what you actually store / transmit.
   */
  cipherText: string;

  /**
   * IV for inner (layer 1) AES-256-GCM encryption, base64.
   * Used when decrypting after peeling off outer layer.
   */
  iv1: string;

  /**
   * IV for outer (layer 2) AES-256-GCM encryption, base64.
   */
  iv2: string;

  /**
   * Salt used to derive key 1 (primary) via scrypt, base64.
   */
  salt1: string;

  /**
   * Salt used to derive key 2 (secondary) via scrypt, base64.
   */
  salt2: string;
}

/** Optional: shared options type if you want it globally */
export interface EncryptOptions {
  /** Primary secret (or raw 32-byte key) – falls back to env if omitted */
  primaryKey?: string | Buffer;
  /** Secondary secret (or raw 32-byte key) – falls back to env if omitted */
  secondaryKey?: string | Buffer;
  /**
   * Optional external salt to make key derivation deterministic across
   * services. If omitted, a random salt is generated per call.
   */
  kdfSalt?: string | Buffer;
}
