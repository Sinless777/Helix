/**
 * Base user route templates. These use `{user-id}` as a placeholder.
 * Use `getUserPage()` to resolve them to an actual user.
 */
export const UserPages = {
  profile: '/{user-id}',
  settings: '/{user-id}/settings',
  dashboard: '/{user-id}/dashboard',
} as const;

/**
 * Replace `{user-id}` with an actual user ID (or username slug).
 *
 * @param page One of the keys in UserPages ("profile", "settings", "dashboard")
 * @param userId The user ID or slug to substitute
 * @returns A string with the placeholder replaced, e.g. "/u_123/dashboard"
 */
export function getUserPage(page: keyof typeof UserPages, userId: string): string {
  const template = UserPages[page];
  return template.replace('{user-id}', encodeURIComponent(userId));
}
