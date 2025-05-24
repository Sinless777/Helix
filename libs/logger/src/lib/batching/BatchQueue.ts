import crypto from 'crypto'
import { EventEmitter } from 'events'
import { calculateBackoff, backoff, BackoffOptions } from '../utils/backoff'
import type { LogRecord } from '../../types/LogRecord'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env['LOGGER_ENCRYPTION_KEY'] || '', 'hex')

/**
 * Configuration options for the BatchQueue.
 */
export interface BatchQueueOptions {
  /** Maximum records per batch before auto-flush (default: 100) */
  maxBatchSize?: number
  /** Time window in ms to auto-flush (default: 5000) */
  flushInterval?: number
  /** Backoff configuration for retries */
  backoffOptions?: BackoffOptions
  /** Maximum retry attempts on failure (default: 5) */
  maxRetries?: number
}

/**
 * Handles batching of log records with optional encryption, retry/backoff, and graceful shutdown.
 * @class
 */
export class BatchQueue extends EventEmitter {
  /** Pending records in the current batch */
  private queue: LogRecord[] = []
  /** Timer reference for scheduled flush */
  private timer?: NodeJS.Timeout
  /** Configuration */
  private readonly opts: Required<BatchQueueOptions>
  /** Flag indicating shutdown in progress */
  private shuttingDown = false

  /**
   * @param sendFn Function to handle sending encrypted batch payload
   * @param options BatchQueueOptions to customize behavior
   */
  constructor(
    private sendFn: (encryptedPayload: string) => Promise<void>,
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
   * Add a record to the batch queue.
   * @method
   * @param record LogRecord to enqueue
   */
  public enqueue(record: LogRecord): void {
    if (this.shuttingDown) return
    this.queue.push(record)
    if (this.queue.length >= this.opts.maxBatchSize) {
      this.flush()
    }
  }

  /**
   * Flush the current batch: encrypt and send with retries.
   * @method
   * @returns Promise resolving when flush completes
   */
  public async flush(): Promise<void> {
    if (this.queue.length === 0) return
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
    // After max retries, emit failure
    this.emit('failed', batch)
  }

  /**
   * Start the periodic flush timer.
   * @private
   */
  private startTimer(): void {
    this.timer = setInterval(() => this.flush(), this.opts.flushInterval)
  }

  /**
   * Stop the periodic flush timer.
   * @private
   */
  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  /**
   * Encrypt a batch of records into a Base64 string using AES-256-GCM.
   * @private
   * @param batch Array of LogRecord
   * @returns Encrypted payload as base64 string
   */
  private encryptBatch(batch: LogRecord[]): string {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
    const data = Buffer.concat([
      cipher.update(JSON.stringify(batch), 'utf8'),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, tag, data]).toString('base64')
  }

  /**
   * Gracefully shutdown: stop timer and flush remaining records.
   * @method
   */
  public async shutdown(): Promise<void> {
    this.shuttingDown = true
    this.stopTimer()
    await this.flush()
    this.emit('shutdown')
  }
}
