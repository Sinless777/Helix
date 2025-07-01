import type { LogRecord, LogLevel } from "../logger";
import { DriverBase } from "./driver.base";
import LogstashTransport from "winston3-logstash-transport";

/**
 * Configuration options for Logstash transport.
 */
export interface LogstashDriverOptions {
  /** Hostname or IP of the Logstash server */
  host: string;
  /** Port for TCP/UDP Logstash input */
  port: number;
  /** Protocol mode: TCP or UDP */
  mode?: "tcp" | "udp" | "tcp4" | "tcp6" | "udp4" | "udp6";
  /** Minimum log level for this driver */
  level?: LogLevel;
  /** Optional formatter to transform LogRecord before send */
  formatter?: (record: LogRecord) => object;
}

/**
 * LogstashDriver sends structured logs to a Logstash input
 * using the winston3-logstash-transport transport.
 */
export class LogstashDriver extends DriverBase {
  private transport?: InstanceType<typeof LogstashTransport>;

  constructor(private options: LogstashDriverOptions) {
    super();
  }

  /**
   * Initialize the Logstash transport and start the driver.
   */
  /**
   * Initialize the Logstash transport and start the driver.
   */
  public async initialize(): Promise<void> {
    const { host, port, mode = "udp", level } = this.options;
    this.transport = new LogstashTransport({
      host,
      port,
      mode,
      level,
    });
    await this.start();
  }

  /**
   * Mark driver as running.
   */
  public async start(): Promise<void> {
    this.setRunning(true);
  }

  /**
   * Log a record to Logstash.
   */
  public async log(record: LogRecord): Promise<void> {
    const t = this.transport;
    if (!this.isEnabled() || !this.isRunning() || !t) return;
    // Apply optional formatter if provided
    const payload = this.options.formatter
      ? this.options.formatter(record)
      : { ...record, level: record.level, message: record.message };
    await new Promise<void>((resolve, reject) => {
      t.log(payload, (err?: Error) => (err ? reject(err) : resolve()));
    });
  }

  /**
   * Mark driver as stopped.
   */
  public async stop(): Promise<void> {
    this.setRunning(false);
  }

  /**
   * Shutdown the driver, attempt to close transport if available.
   */
  public async shutdown(): Promise<void> {
    if (this.transport && typeof this.transport.close === "function") {
      await this.transport.close();
    }
    await this.stop();
  }
}
