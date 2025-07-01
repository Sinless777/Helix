import RedisTransport from "winston-redis";
import type { LogRecord, LogLevel } from "../logger";
import { DriverBase } from "./driver.base";

/**
 * Redis transport options for winston-redis.
 */
export interface RedisDriverOptions {
  /** Redis server host (default: 'localhost') */
  host?: string;
  /** Redis server port (default: 6379) */
  port?: number;
  /** Redis auth password */
  auth?: string;
  /** A redis client instance or options for node-redis client */
  redis?: unknown;
  /** Number of log messages to store in the list (default: 200) */
  length?: number;
  /** Name of the Redis list/container (default: 'winston') */
  container?: string;
  /** Optional channel to publish logs to */
  channel?: string;
  /** Custom metadata fields to add to each log (default: {}) */
  meta?: Record<string, unknown>;
  /** Store meta at top level rather than under 'meta' key (default: false) */
  flatMeta?: boolean;
  /** Minimum level to log (default: logger's level) */
  level?: LogLevel;
}

/**
 * RedisDriver pushes log records into a Redis list or channel via winston-redis.
 */
export class RedisDriver extends DriverBase {
  private transport?: InstanceType<typeof RedisTransport>;

  constructor(private options: RedisDriverOptions = {}) {
    super();
  }

  /**
   * Initialize the Redis transport and mark running.
   */
  public async initialize(): Promise<void> {
    const {
      host = "localhost",
      port = 6379,
      auth,
      redis,
      length = 200,
      container = "winston",
      channel,
      meta = {},
      flatMeta = false,
      level,
    } = this.options;

    this.transport = new RedisTransport({
      host,
      port,
      auth,
      redis,
      length,
      container,
      channel,
      meta,
      flatMeta,
      level,
    });

    await this.start();
  }

  /**
   * Start the driver and mark as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true);
  }

  /**
   * Log a record to Redis; delegate to transport.
   */
  public async log(record: LogRecord): Promise<void> {
    const transport = this.transport;
    if (!this.isEnabled() || !this.isRunning() || !transport) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      transport.log(
        { ...record, level: record.level, message: record.message },
        (err?: Error) => (err ? reject(err) : resolve()),
      );
    });
  }

  /**
   * Stop the driver and mark as not running.
   */
  public async stop(): Promise<void> {
    this.setRunning(false);
  }

  /**
   * Shutdown the driver and clean up.
   */
  public async shutdown(): Promise<void> {
    await this.stop();
  }
}
