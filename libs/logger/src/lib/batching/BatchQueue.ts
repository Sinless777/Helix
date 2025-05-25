// libs/logger/src/lib/batching/BatchQueue.ts

import crypto from 'crypto'
import { EventEmitter } from 'events'
import { calculateBackoff, backoff, BackoffOptions } from '../utils/backoff'
import type { LogRecord } from '../../types/LogRecord'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env['LOGGER_ENCRYPTION_KEY'] || '', 'hex')

/**
 * Configuration options for BatchQueue.
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
 * Handles batching of LogRecord entries with optional
 * AES-256-GCM encryption, retry/backoff on failure,
 * and graceful shutdown.
 */
export class BatchQueue extends EventEmitter {
  private queue: LogRecord[] = []
  private timer?: NodeJS.Timeout
  private readonly opts: Required<BatchQueueOptions>
  private shuttingDown = false

  /**
   * @param sendFn - Function that sends an encrypted batch payload
   * @param options - Optional batch queue settings
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
   * Add a record to the queue. If the queue size
   * reaches maxBatchSize, triggers a flush.
   *
   * @param record - The LogRecord to enqueue
   */
  public enqueue(record: LogRecord): void {
    if (this.shuttingDown) return
    this.queue.push(record)
    if (this.queue.length >= this.opts.maxBatchSize) {
      void this.flush()
    }
  }

  /**
   * Flushes the current batch: encrypts the batch and
   * attempts to send it, retrying with backoff on error.
   *
   * @returns Promise<void> once flushed or retries exhausted
   */
  public async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const batch = this.queue.splice(0)
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

    this.emit('failed', batch)
  }

  /**
   * Stops the periodic flush timer.
   */
  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  /**
   * Starts the periodic flush timer based on flushInterval.
   */
  private startTimer(): void {
    this.timer = setInterval(() => void this.flush(), this.opts.flushInterval)
  }

  /**
   * Encrypts a batch of log records into a Base64 string
   * using AES-256-GCM with the configured key.
   *
   * @param batch - Array of LogRecord entries
   * @returns Base64-encoded encrypted payload
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
   * Gracefully shuts down the queue: stops the timer,
   * flushes remaining records, and emits a shutdown event.
   *
   * @returns Promise<void> once shutdown is complete
   */
  public async shutdown(): Promise<void> {
    this.shuttingDown = true
    this.stopTimer()
    await this.flush()
    this.emit('shutdown')
  }
}

export default BatchQueue
