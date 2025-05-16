import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../base.entity'

/**
 * Stores per-user settings and preferences.
 *
 * Inherits common fields (id, timestamps, soft-delete) from BaseEntity.
 */
@Entity({ tableName: 'user_settings' })
export class UserSetting extends BaseEntity {
  /**
   * Whether the user is subscribed to the newsletter.
   */
  @Property({ type: 'boolean', default: false, name: 'newsletter' })
  newsletter = false

  /**
   * Whether the user has access to premium features.
   */
  @Property({ type: 'boolean', default: false, name: 'premium' })
  premium = false

  /**
   * Whether the user has enabled two-factor authentication.
   */
  @Property({
    type: 'boolean',
    default: false,
    name: 'two_factor_authentication',
  })
  twoFactorAuthentication = false
}
