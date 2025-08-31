// libs/auth/src/lib/dtos/login.dto.ts

import {
  IsEmail,
  IsString,
  MinLength,
  ValidateIf,
  IsOptional,
  IsBoolean,
  IsUUID,
  Matches,
  Length,
  IsUrl
} from 'class-validator'

/**
 * Login with either email OR username.
 * - Exactly one of `email` or `username` must be provided.
 * - `password` is required.
 */
export class LoginDto {
  /** Email (required if username is not provided) */
  @ValidateIf((o) => o.username == null)
  @IsEmail()
  email?: string

  /** Username (required if email is not provided) */
  @ValidateIf((o) => o.email == null)
  @IsString()
  @Matches(/^[a-zA-Z0-9_.-]{3,50}$/, {
    message:
      'username must be 3–50 chars and only contain letters, numbers, underscore, dot, or hyphen'
  })
  username?: string

  /** Password (min 8 chars) */
  @IsString()
  @MinLength(8)
  password!: string

  /** Optional: active org context (UUID) */
  @IsOptional()
  @IsUUID()
  orgId?: string

  /** Optional: remember the session (affects refresh TTL/cookie) */
  @IsOptional()
  @IsBoolean()
  remember?: boolean

  /** Optional: 6–8 digit TOTP code for MFA step */
  @IsOptional()
  @Matches(/^\d{6,8}$/, { message: 'mfaCode must be 6–8 digits' })
  mfaCode?: string

  /** Optional: client device identifier (analytics/risk) */
  @IsOptional()
  @IsString()
  @Length(1, 128)
  deviceId?: string

  /** Optional: where to return after login (server-validated) */
  @IsOptional()
  @IsUrl({ require_protocol: true })
  redirectUri?: string
}

/**
 * Helper to resolve the identifier in controllers/services without branching.
 */
export const loginIdentifier = (
  dto: LoginDto
): { kind: 'email' | 'username'; value: string } => {
  if (dto.email) return { kind: 'email', value: dto.email }
  if (dto.username) return { kind: 'username', value: dto.username }
  // Should never happen if validation runs, but keep a safe fallback:
  return { kind: 'username', value: '' }
}
