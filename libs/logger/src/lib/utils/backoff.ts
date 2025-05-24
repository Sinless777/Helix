/**
 * Exponential backoff with optional jitter.
 * Computes a delay based on the attempt number and waits that duration.
 */

/**
 * Configuration for backoff calculation.
 */
export interface BackoffOptions {
  /** Initial delay in milliseconds (default: 100ms) */
  baseDelay?: number
  /** Multiplier per attempt (default: 2) */
  factor?: number
  /** Maximum delay cap in milliseconds (default: 10000ms) */
  maxDelay?: number
  /** Apply full jitter by randomizing delay between 0 and the calculated delay (default: true) */
  jitter?: boolean
}

/**
 * Calculate the backoff delay for a given attempt.
 * @param attempt - The retry attempt count (1-based)
 * @param options - Optional backoff configuration
 * @returns delay in milliseconds
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

  // Exponential growth
  let delay = Math.min(baseDelay * Math.pow(factor, attempt - 1), maxDelay)

  if (jitter) {
    // Randomize between 0 and delay
    delay = Math.random() * delay
  }

  return delay
}

/**
 * Sleep for the calculated backoff delay based on attempt.
 * @param attempt - The retry attempt count (1-based)
 * @param options - Optional backoff configuration
 */
export async function backoff(
  attempt: number,
  options: BackoffOptions = {},
): Promise<void> {
  const delay = calculateBackoff(attempt, options)
  return new Promise((resolve) => setTimeout(resolve, delay))
}
