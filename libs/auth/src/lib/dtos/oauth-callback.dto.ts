// libs/auth/src/lib/dtos/oauth-callback.dto.ts

import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateIf
} from 'class-validator'
import type { OAuthProvider } from '../types/auth.types'

/**
 * Runtime list for class-validator and compile-time type safety.
 * Keep in sync with OAuthProvider in ../types/auth.types.ts
 */
export const OAUTH_PROVIDERS = [
  'google',
  'github',
  'discord',
  'facebook'
] as const satisfies ReadonlyArray<OAuthProvider>

/** Route params: /auth/oauth/:provider/callback */
export class OAuthCallbackParamsDto {
  @IsIn([...OAUTH_PROVIDERS], {
    message: `provider must be one of: ${OAUTH_PROVIDERS.join(', ')}`
  })
  provider!: OAuthProvider
}

/** Query string returned to your callback endpoint */
export class OAuthCallbackQueryDto {
  /** CSRF/state value you issued at the start of the flow */
  @IsString()
  @Length(8, 512)
  state!: string

  /**
   * Authorization Code (present on success for authorization_code flows).
   * Required when `error` is not present.
   */
  @ValidateIf((o) => !o.error)
  @IsString()
  @Length(1, 2048)
  code?: string

  /**
   * Error code from the provider (e.g., access_denied).
   * Required when `code` is not present.
   */
  @ValidateIf((o) => !o.code)
  @IsString()
  error?: string

  /** Optional error description from the provider */
  @IsOptional()
  @IsString()
  error_description?: string

  /** Optional error URI with more details */
  @IsOptional()
  @IsUrl({ require_protocol: true })
  error_uri?: string

  /** Space-delimited scopes (not always returned) */
  @IsOptional()
  @IsString()
  scope?: string

  /**
   * Some OIDC providers may include an ID token in hybrid flows.
   * You can ignore it if you always exchange the code server-side.
   */
  @IsOptional()
  @IsString()
  id_token?: string

  /**
   * Optional client-provided deep link you whitelisted server-side.
   * Validate on the server before redirecting users!
   */
  @IsOptional()
  @IsUrl({ require_protocol: true })
  redirectUri?: string
}

/** Type guard convenience */
export const isOAuthErrorCallback = (
  q: OAuthCallbackQueryDto
): q is OAuthCallbackQueryDto & { error: string } =>
  typeof q.error === 'string' && q.error.length > 0
