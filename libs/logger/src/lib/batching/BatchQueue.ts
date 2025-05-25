// libs/logger/src/lib/batching/BatchQueue.ts

import crypto from 'crypto'
import { EventEmitter } from 'events'
import { calculateBackoff, backoff, BackoffOptions } from '../utils/backoff'
import type { LogRecord } from '../../types/LogRecord'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env['LOGGER_ENCRYPTION_KEY'] || '', 'hex')

/**
 * @interface BatchQueueOptions
 * @description Configuration options for {@link BatchQueue}.
 */
export interface BatchQueueOptions {
  /** Maximum records per batch before auto-flush (default: 100) */
  maxBatchSize?: number
  /** Time window in milliseconds to auto-flush (default: 5000ms) */
  flushInterval?: number
  /** Backoff configuration for retry delays */
  backoffOptions?: BackoffOptions
  /** Maximum retry attempts on failure (default: 5) */
  maxRetries?: number
}

/**
 * @class BatchQueue
 * @extends EventEmitter
 * @description
 *   Handles batching of `LogRecord`s with optional AES-256-GCM encryption,
 *   retry/backoff on failure, and graceful shutdown behavior.
 *
 * @fires BatchQueue#flushed - Emitted after a successful flush
 * @fires BatchQueue#error   - Emitted on each retryable error
 * @fires BatchQueue#failed  - Emitted after exhausting retries
 * @fires BatchQueue#shutdown - Emitted once shutdown completes
 */
export class BatchQueue extends EventEmitter {
  /** @property {LogRecord[]} Pending records in the current batch */
  private queue: LogRecord[] = []

  /** @property {NodeJS.Timeout | undefined} Timer for scheduled flush */
  private timer?: NodeJS.Timeout

  /** @property {Required<BatchQueueOptions>} Resolved configuration */
  private readonly opts: Required<BatchQueueOptions>

  /** @property {boolean} Indicates whether a shutdown is in progress */
  private shuttingDown = false

  /**
   * @constructor
   * @param sendFn - Callback to handle sending the encrypted batch payload
   * @param options - Customization options for batch behavior
   */
  constructor(
    private readonly sendFn: (encryptedPayload: string) => Promise<void>,
    options: BatchQueueOptions = {},
  ) {
    super()
    this.opts = {
      maxBatchSize: 100,
      flushInterval: 5000,
      backoffOptions: {},
      maxRetries: 5,
      ...options,
    }
    this.startTimer()
  }

  /**
   * @method enqueue
   * @description Add a `LogRecord` to the batch. Automatically flushes
   *   when `maxBatchSize` is reached.
   * @param record - The record to enqueue
   */
  public enqueue(record: LogRecord): void {
    if (this.shuttingDown) return
    this.queue.push(record)
    if (this.queue.length >= this.opts.maxBatchSize) {
      void this.flush()
    }
  }

  /**
   * @method flush
   * @description Flushes the current batch: encrypts and sends with retries.
   * @returns Promise that resolves once the batch is sent or retries are exhausted
   * @fires BatchQueue#flushed
   * @fires BatchQueue#error
   * @fires BatchQueue#failed
   */
  public async flush(): Promise<void> {
    if (this.queue.length === 0) return

    // Extract and clear the batch
    const batch = this.queue.splice(0, this.queue.length)
    const payload = this.encryptBatch(batch)

    for (let attempt = 1; attempt <= this.opts.maxRetries; attempt++) {
      try {
        await this.sendFn(payload)
        this.emit('flushed', batch)
        return
      } catch (err) {
        this.emit('error', err, attempt)
        await backoff(attempt, this.opts.backoffOptions)
      }
    }

    // All retries exhausted
    this.emit('failed', batch)
  }

  /**
   * @private
   * @method startTimer
   * @description Begins the periodic flush timer based on `flushInterval`.
   */
  private startTimer(): void {
    this.timer = setInterval(() => void this.flush(), this.opts.flushInterval)
  }

  /**
   * @private
   * @method stopTimer
   * @description Stops the periodic flush timer.
   */
  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  /**
   * @private
   * @method encryptBatch
   * @description Encrypts a batch of log records into a Base64 string
   *   using AES-256-GCM and the configured `LOGGER_ENCRYPTION_KEY`.
   * @param batch - Array of `LogRecord` to encrypt
   * @returns Encrypted payload as a base64-encoded string
   */
  private encryptBatch(batch: LogRecord[]): string {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
    const plaintext = Buffer.from(JSON.stringify(batch), 'utf8')
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, tag, ciphertext]).toString('base64')
  }

  /**
   * @method shutdown
   * @description Gracefully stops the timer and flushes any remaining records.
   * @returns Promise that resolves once shutdown is complete
   * @fires BatchQueue#shutdown
   */
  public async shutdown(): Promise<void> {
    this.shuttingDown = true
    this.stopTimer()
    await this.flush()
    this.emit('shutdown')
  }
}

export default BatchQueue
