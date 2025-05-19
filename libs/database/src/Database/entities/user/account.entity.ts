import { Entity, Property, ManyToOne } from '@mikro-orm/core'
import { User } from './user.entity'
import { BaseEntity } from '../base.entity'

/**
 * Represents an OAuth account linked to a user.
 *
 * Inherits common fields (id, timestamps, soft-delete) from BaseEntity.
 */
@Entity({ tableName: 'accounts' })
export class Account extends BaseEntity {
  /**
   * The user that this account belongs to.
   */
  @ManyToOne(() => User)
  user!: User

  /**
   * Type of the account (e.g., 'oauth').
   */
  @Property({ type: 'text' })
  type!: string

  /**
   * Provider name (e.g., 'google', 'github').
   */
  @Property({ type: 'text' })
  provider!: string

  /**
   * Unique identifier of the account at the provider.
   */
  @Property({ type: 'text', name: 'provider_account_id' })
  providerAccountId!: string

  /**
   * OAuth refresh token.
   */
  @Property({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken?: string

  /**
   * OAuth access token.
   */
  @Property({ type: 'text', nullable: true, name: 'access_token' })
  accessToken?: string

  /**
   * UNIX timestamp (in seconds) when the access token expires.
   */
  @Property({ type: 'bigint', nullable: true, name: 'expires_at' })
  expiresAt?: number

  /**
   * OAuth token type (e.g., 'Bearer').
   */
  @Property({ type: 'text', nullable: true, name: 'token_type' })
  tokenType?: string

  /**
   * Scope granted by the OAuth provider.
   */
  @Property({ type: 'text', nullable: true })
  scope?: string

  /**
   * ID token (JWT) returned by the provider.
   */
  @Property({ type: 'text', nullable: true, name: 'id_token' })
  idToken?: string

  /**
   * Session state returned during OAuth handshake.
   */
  @Property({ type: 'text', nullable: true, name: 'session_state' })
  sessionState?: string

  /**
   * Secret used for OAuth 1.0.
   */
  @Property({ type: 'text', nullable: true, name: 'oauth_token_secret' })
  oauthTokenSecret?: string

  /**
   * Token used for OAuth 1.0.
   */
  @Property({ type: 'text', nullable: true, name: 'oauth_token' })
  oauthToken?: string
}
