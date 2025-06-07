// libs/logger/src/lib/utils/globMatcher.ts

/**
 * Convert a glob pattern into a RegExp for matching strings.
 *
 * Supports:
 * - `*` matches any sequence of characters (including none).
 * - `?` matches exactly one character.
 *
 * @remarks
 * This utility first escapes all RegExp-special characters in the input pattern,
 * then replaces glob wildcards with their RegExp equivalents.
 *
 * @param pattern - Glob pattern (e.g., `"transactions.*"`, `"user?Id"`).
 * @returns A RegExp anchored at start (`^`) and end (`$`) to test exact matches.
 *
 * @example
 * ```ts
 * const regex = globToRegExp('user*');
 * console.log(regex.test('user123')); // true
 * console.log(regex.test('user'));    // true
 * console.log(regex.test('usr'));     // false
 * ```
 */
export function globToRegExp(pattern: string): RegExp {
  // Escape all RegExp-special characters except for glob wildcards
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')

  // Transform glob wildcards:
  // '*' → '.*'  (zero or more characters)
  // '?' → '.'   (exactly one character)
  const regexString =
    '^' + escaped.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'

  return new RegExp(regexString)
}

/**
 * Test whether a given string value matches a glob pattern.
 *
 * @param pattern - Glob pattern to match against (e.g., `"audit.*"`, `"file?.txt"`).
 * @param value - String to test for a match.
 * @returns `true` if `value` satisfies the glob pattern; otherwise `false`.
 *
 * @example
 * ```ts
 * console.log(globMatch('log-*', 'log-2025-05-24')); // true
 * console.log(globMatch('log-?', 'log-a'));          // true
 * console.log(globMatch('log-?', 'log-12'));         // false
 * ```
 */
export function globMatch(pattern: string, value: string): boolean {
  const regex = globToRegExp(pattern)
  return regex.test(value)
}
