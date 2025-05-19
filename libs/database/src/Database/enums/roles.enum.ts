// libs/shared/database/src/Database/enums/roles.enum.ts

/**
 * @enum Role
 * @description
 * Defines user roles and access levels within the application.
 */
export enum Role {
  /** Standard user with basic read/write permissions */
  User = 'user',

  /** User with elevated privileges for content moderation */
  Moderator = 'moderator',

  /** User with access to application features and settings */
  Editor = 'editor',

  /** Developer with access to code-level and platform integrations */
  Developer = 'developer',

  /** Support staff with permissions to handle user issues */
  Support = 'support',

  /** Administrator with full system access and management capabilities */
  Admin = 'admin',

  /** Super administrator with highest-level control and overrides */
  SuperAdmin = 'superadmin',

  /** Read-only access for auditing or reporting purposes */
  Viewer = 'viewer',
}
