// libs/auth/src/lib/dtos/webauthn.dto.ts

import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'

/** Conservative base64url checker for WebAuthn binary fields (no padding). */
export const BASE64URL_RE = /^[A-Za-z0-9_-]+$/

/* -----------------------------------------------------------------------------
 * Begin Registration
 * -------------------------------------------------------------------------- */

export class WebAuthnBeginRegistrationDto {
  /** Your internal user id (recommended UUID). */
  @IsUUID()
  userId!: string

  /** Optional display fields for the authenticator UI. */
  @IsOptional()
  @IsString()
  @Length(1, 64)
  username?: string

  @IsOptional()
  @IsString()
  @Length(1, 64)
  displayName?: string

  /** Optional nickname for the credential being created. */
  @IsOptional()
  @IsString()
  @Length(1, 64)
  deviceName?: string

  /** Relying party id override (defaults to server config). */
  @IsOptional()
  @IsString()
  @Length(1, 255)
  rpId?: string

  @IsOptional()
  @IsIn(['none', 'indirect', 'direct', 'enterprise'])
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise'

  @IsOptional()
  @IsIn(['platform', 'cross-platform'])
  authenticatorAttachment?: 'platform' | 'cross-platform'

  @IsOptional()
  @IsIn(['required', 'preferred', 'discouraged'])
  userVerification?: 'required' | 'preferred' | 'discouraged'

  /** Resident key preference (a.k.a. discoverable credentials). */
  @IsOptional()
  @IsIn(['required', 'preferred', 'discouraged'])
  residentKey?: 'required' | 'preferred' | 'discouraged'

  /** Timeout in milliseconds for the client options. */
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(180000)
  timeoutMs?: number
}

/* -----------------------------------------------------------------------------
 * Verify Registration (attestation)
 * -------------------------------------------------------------------------- */

export class WebAuthnAttestationResponseDto {
  @IsString()
  @Matches(BASE64URL_RE, { message: 'clientDataJSON must be base64url' })
  clientDataJSON!: string

  @IsString()
  @Matches(BASE64URL_RE, { message: 'attestationObject must be base64url' })
  attestationObject!: string

  /** Optional transports reported by the browser (e.g., ["usb","internal"]). */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  transports?: string[]
}

export class WebAuthnRegistrationCredentialDto {
  @IsString()
  @Matches(BASE64URL_RE, { message: 'id must be base64url' })
  id!: string

  @IsString()
  @Matches(BASE64URL_RE, { message: 'rawId must be base64url' })
  rawId!: string

  @ValidateNested()
  @Type(() => WebAuthnAttestationResponseDto)
  response!: WebAuthnAttestationResponseDto

  @IsIn(['public-key'])
  type!: 'public-key'

  @IsOptional()
  @IsIn(['platform', 'cross-platform'])
  authenticatorAttachment?: 'platform' | 'cross-platform'
}

/** Server looks up the stored challenge by this state id. */
export class WebAuthnVerifyRegistrationDto {
  @IsString()
  @Length(8, 256)
  stateId!: string

  @ValidateNested()
  @Type(() => WebAuthnRegistrationCredentialDto)
  credential!: WebAuthnRegistrationCredentialDto
}

/* -----------------------------------------------------------------------------
 * Begin Authentication (assertion)
 * -------------------------------------------------------------------------- */

export class WebAuthnBeginAuthenticationDto {
  /** Provide one of userId/username to scope allowed credentials (optional). */
  @IsOptional()
  @IsUUID()
  userId?: string

  @IsOptional()
  @IsString()
  @Length(1, 64)
  username?: string

  /** If you already know allowed credential ids, pass them. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(BASE64URL_RE, {
    each: true,
    message: 'allowCredentialIds must be base64url strings'
  })
  allowCredentialIds?: string[]

  /** Optional overrides */
  @IsOptional()
  @IsString()
  @Length(1, 255)
  rpId?: string

  @IsOptional()
  @IsIn(['required', 'preferred', 'discouraged'])
  userVerification?: 'required' | 'preferred' | 'discouraged'

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(180000)
  timeoutMs?: number
}

/* -----------------------------------------------------------------------------
 * Verify Authentication (assertion)
 * -------------------------------------------------------------------------- */

export class WebAuthnAssertionResponseDto {
  @IsString()
  @Matches(BASE64URL_RE, { message: 'clientDataJSON must be base64url' })
  clientDataJSON!: string

  @IsString()
  @Matches(BASE64URL_RE, { message: 'authenticatorData must be base64url' })
  authenticatorData!: string

  @IsString()
  @Matches(BASE64URL_RE, { message: 'signature must be base64url' })
  signature!: string

  @IsOptional()
  @IsString()
  @Matches(BASE64URL_RE, { message: 'userHandle must be base64url' })
  userHandle?: string
}

export class WebAuthnAuthenticationCredentialDto {
  @IsString()
  @Matches(BASE64URL_RE, { message: 'id must be base64url' })
  id!: string

  @IsString()
  @Matches(BASE64URL_RE, { message: 'rawId must be base64url' })
  rawId!: string

  @ValidateNested()
  @Type(() => WebAuthnAssertionResponseDto)
  response!: WebAuthnAssertionResponseDto

  @IsIn(['public-key'])
  type!: 'public-key'

  @IsOptional()
  @IsIn(['platform', 'cross-platform'])
  authenticatorAttachment?: 'platform' | 'cross-platform'
}

export class WebAuthnVerifyAuthenticationDto {
  @IsString()
  @Length(8, 256)
  stateId!: string

  @ValidateNested()
  @Type(() => WebAuthnAuthenticationCredentialDto)
  credential!: WebAuthnAuthenticationCredentialDto
}
