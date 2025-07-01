import type { LogRecord } from "../logger";

/**
 * Base abstract class for all HelixLogger drivers.
 * Drivers must implement lifecycle hooks and log handling,
 * and support enable/disable and start/stop controls.
 */
export abstract class DriverBase {
  private enabled = false;
  private running = false;

  /**
   * Initialize resources (e.g., connections, buffers).
   * Called once before any logging when init() is invoked.
   */
  abstract initialize(): Promise<void>;

  /**
   * Start the driver’s active processing (e.g., begin flushing batches).
   * Should set isRunning() to true when active.
   */
  abstract start(): Promise<void>;

  /**
   * Process a single structured log record.
   * @param record - The log entry with metadata and context.
   */
  abstract log(record: LogRecord): Promise<void>;

  /**
   * Stop active processing (e.g., pause batches).
   * After calling stop(), isRunning() should return false.
   */
  abstract stop(): Promise<void>;

  /**
   * Shutdown the driver, flush pending logs, and release resources.
   * Called during shutdown() of the logger.
   */
  abstract shutdown(): Promise<void>;

  /**
   * Enable this driver so it accepts new log records.
   */
  public enable(): void {
    this.enabled = true;
  }

  /**
   * Disable this driver; incoming logs will be ignored.
   */
  public disable(): void {
    this.enabled = false;
  }

  /**
   * Whether this driver is enabled.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Whether the driver is currently running (i.e., started but not stopped).
   */
  public isRunning(): boolean {
    return this.running;
  }

  /**
   * Internal helper for subclasses to update running state.
   * @param state - true if running, false if stopped.
   */
  protected setRunning(state: boolean): void {
    this.running = state;
  }
}
