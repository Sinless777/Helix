import { createHmac } from 'crypto';

export type HmacFormat = 'hex' | 'base64' | 'base64url';

export const hmacSha256 = (
  secret: string | Buffer,
  data: string | Buffer,
  format: HmacFormat = 'hex',
): string => createHmac('sha256', secret).update(data).digest(format);

export const verifyHmac = (
  signature: string,
  secret: string | Buffer,
  data: string | Buffer,
  format: HmacFormat = 'hex',
): boolean => hmacSha256(secret, data, format) === signature;
