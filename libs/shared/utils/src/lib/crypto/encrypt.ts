import { createCipheriv, randomBytes, scryptSync } from 'crypto';
import type { EncryptedPayload, EncryptOptions } from '@helix-ai/types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

const deriveKey = (secret: string | Buffer, salt: Buffer): Buffer => {
  if (Buffer.isBuffer(secret) && secret.length === 32) return secret;
  const material = Buffer.isBuffer(secret) ? secret.toString('utf8') : secret;
  return scryptSync(material, salt, 32);
};

export const encrypt = <T = unknown>(
  data: T,
  options: EncryptOptions = {},
): EncryptedPayload => {
  const primarySecret = options.primaryKey ?? process.env.HELIX_CRYPTO_KEY_PRIMARY;
  if (!primarySecret) throw new Error('Missing primary encryption key');

  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(primarySecret, salt);

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const body = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    version: 1,
    algorithm: ALGORITHM,
    kdf: 'scrypt',
    layers: 2,
    cipherText: Buffer.concat([tag, body]).toString('base64'),
    iv1: iv.toString('base64'),
    iv2: '',
    salt1: salt.toString('base64'),
    salt2: '',
  };
};
