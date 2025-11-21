// libs/shared/utils/src/lib/crypto/hash-password.ts

import { createHash } from 'crypto';

/**
 * Deterministic password hash helper.
 *
 * Default scheme:
 *   SHA-256( lowercasedEmail + ':' + password + ':' + PEPPER )
 *
 * - Email is lowercased to avoid case-based duplicates.
 * - A global "pepper" is read from HELIX_CRYPTO_PASSWORD_PEPPER if present.
 * - Output is a hex string suitable for storing in the DB.
 *
 * NOTE:
 * - This is a simple KDF-style hash, not a full password hashing scheme
 *   like argon2/bcrypt. For public production auth, prefer argon2id or bcrypt.
 */
export const hashPassword = (email: string, password: string): string => {
  const normalizedEmail = email.trim().toLowerCase();
  const pepper = process.env.HELIX_CRYPTO_PASSWORD_PEPPER ?? '';

  const material = `${normalizedEmail}:${password}:${pepper}`;

  return createHash('sha256').update(material, 'utf8').digest('hex');
};

/**
 * Constant-time equality check for stored password hashes.
 * Helps reduce timing side-channel exposure when comparing hashes.
 */
export const comparePasswordHash = (hashA: string, hashB: string): boolean => {
  const a = Buffer.from(hashA, 'utf8');
  const b = Buffer.from(hashB, 'utf8');

  if (a.length !== b.length) {
    return false;
  }

  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }

  return diff === 0;
};
