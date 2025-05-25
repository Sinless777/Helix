// libs/logger/src/lib/utils/backoff.ts

/**
 * Configuration options for exponential backoff calculation.
 *
 * @interface
 */
export interface BackoffOptions {
  /**
   * Initial delay in milliseconds.
   * @default 100
   */
  baseDelay?: number

  /**
   * Multiplicative factor applied per attempt.
   * @default 2
   */
  factor?: number

  /**
   * Maximum delay cap in milliseconds.
   * @default 10000
   */
  maxDelay?: number

  /**
   * Whether to apply full jitter (random between 0 and computed delay).
   * @default true
   */
  jitter?: boolean
}

/**
 * Calculate the exponential backoff delay for a given retry attempt.
 *
 * @param attempt - The retry attempt count (1-based).
 * @param options - Optional backoff configuration.
 * @returns The computed delay in milliseconds.
 *
 * @example
 * ```ts
 * const delay = calculateBackoff(3, { baseDelay: 200, factor: 2, maxDelay: 5000 })
 * // delay will be between 0 and min(200 * 2^(3-1), 5000)
 * ```
 */
export function calculateBackoff(
  attempt: number,
  options: BackoffOptions = {},
): number {
  const {
    baseDelay = 100,
    factor = 2,
    maxDelay = 10000,
    jitter = true,
  } = options

  // Calculate exponential growth and cap to maxDelay
  let delay = Math.min(baseDelay * Math.pow(factor, attempt - 1), maxDelay)

  if (jitter) {
    // Apply full jitter: random between 0 and computed delay
    delay = Math.random() * delay
  }

  return delay
}

/**
 * Pause execution for a duration determined by exponential backoff.
 *
 * @param attempt - The retry attempt count (1-based).
 * @param options - Optional backoff configuration.
 * @returns A promise that resolves after the backoff delay.
 *
 * @example
 * ```ts
 * // Wait with backoff before retrying an operation
 * await backoff(2, { baseDelay: 50, factor: 3 })
 * // proceeds after computed delay
 * ```
 */
export async function backoff(
  attempt: number,
  options: BackoffOptions = {},
): Promise<void> {
  const delay = calculateBackoff(attempt, options)
  return new Promise((resolve) => setTimeout(resolve, delay))
}
