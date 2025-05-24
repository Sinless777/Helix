/**
 * Convert a glob pattern (using '*' and '?') into a RegExp.
 * - '*' matches any sequence of characters.
 * - '?' matches any single character.
 * @param pattern - Glob pattern (e.g. "transactions.*", "user?Id")
 * @returns RegExp to test values against the pattern.
 */
export function globToRegExp(pattern: string): RegExp {
  // Escape special regex characters: . ^ $ + ( ) [ ] { } | \
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')

  // Replace glob wildcards with regex equivalents
  const regexString =
    '^' +
    escaped
      .replace(/\*/g, '.*') // '*' => '.*'
      .replace(/\?/g, '.') + // '?' => '.'
    '$'

  return new RegExp(regexString)
}

/**
 * Test whether a value matches a given glob pattern.
 * @param pattern - Glob pattern
 * @param value - String to test
 * @returns true if value matches pattern
 */
export function globMatch(pattern: string, value: string): boolean {
  const regex = globToRegExp(pattern)
  return regex.test(value)
}
