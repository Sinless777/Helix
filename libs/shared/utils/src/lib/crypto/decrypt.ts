import { createDecipheriv, scryptSync } from 'crypto';
import type { EncryptedPayload, EncryptOptions } from '@helix-ai/types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 16;

const deriveKey = (secret: string | Buffer, salt: Buffer): Buffer => {
  if (Buffer.isBuffer(secret) && secret.length === 32) return secret;
  const material = Buffer.isBuffer(secret) ? secret.toString('utf8') : secret;
  return scryptSync(material, salt, 32);
};

export const decrypt = <T = unknown>(
  payload: EncryptedPayload,
  options: EncryptOptions = {},
): T => {
  if (payload.algorithm !== ALGORITHM || payload.kdf !== 'scrypt') {
    throw new Error('Unsupported payload algorithm/kdf');
  }

  const primarySecret = options.primaryKey ?? process.env.HELIX_CRYPTO_KEY_PRIMARY;
  if (!primarySecret) throw new Error('Missing primary encryption key');

  const salt = Buffer.from(payload.salt1, 'base64');
  if (salt.length !== SALT_LENGTH) throw new Error('Invalid salt length');

  const key = deriveKey(primarySecret, salt);

  const iv = Buffer.from(payload.iv1, 'base64');
  if (iv.length !== IV_LENGTH) throw new Error('Invalid IV length');

  const data = Buffer.from(payload.cipherText, 'base64');
  if (data.length <= AUTH_TAG_LENGTH) throw new Error('Ciphertext too short');
  const tag = data.subarray(0, AUTH_TAG_LENGTH);
  const cipherText = data.subarray(AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8')) as T;
};
