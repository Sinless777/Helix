import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';

export const signJwt = (
  payload: JwtPayload,
  secret: string,
  options: SignOptions = {},
): string => jwt.sign(payload, secret, { algorithm: 'HS256', ...options });

export const verifyJwt = <T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string,
): T | null => {
  try {
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
};
