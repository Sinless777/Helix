import type { LogRecord } from '../types/LogRecord';

/**
 * Base abstract class for all Logger drivers.
 * Handles enable/disable and running state management,
 * and enforces lifecycle and log processing contract.
 */
export abstract class DriverBase {
  private enabled = false;
  private running = false;

  /** Initialize resources (connections, buffers). */
  abstract initialize(): Promise<void>;

  /** Start active processing; set running state true. */
  abstract start(): Promise<void>;

  /** Process a single LogRecord. */
  abstract log(record: LogRecord): Promise<void>;

  /** Stop active processing; set running state false. */
  abstract stop(): Promise<void>;

  /** Shutdown driver; flush, release resources. */
  abstract shutdown(): Promise<void>;

  /** Enable this driver for accepting new logs. */
  public enable(): void {
    this.enabled = true;
  }

  /** Disable this driver; ignore new logs. */
  public disable(): void {
    this.enabled = false;
  }

  /** Check if driver is enabled. */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /** Check if driver is currently running. */
  public isRunning(): boolean {
    return this.running;
  }

  /** Protected helper for subclasses to update running state. */
  protected setRunning(state: boolean): void {
    this.running = state;
  }
}
