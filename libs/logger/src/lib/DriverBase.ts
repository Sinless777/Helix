import type { LogRecord } from '../types/LogRecord'

/**
 * Base abstract class for all HelixLogger drivers.
 * Defines lifecycle methods, enable/disable controls, and a static registry for driver instances.
 * @class
 */
export abstract class DriverBase {
  private enabled = false
  private running = false

  /**
   * Static registry of named drivers.
   * @property
   */
  private static registry: Record<string, DriverBase> = {}

  /**
   * Register a driver instance by name.
   * @param name Unique identifier for the driver
   * @param instance Instance of DriverBase
   * @method
   */
  public static registerDriver(name: string, instance: DriverBase): void {
    DriverBase.registry[name] = instance
  }

  /**
   * Retrieve a registered driver by name.
   * @param name Identifier of the driver
   * @returns Driver instance or undefined
   * @method
   */
  public static getDriver(name: string): DriverBase | undefined {
    return DriverBase.registry[name]
  }

  /**
   * Retrieve all registered drivers.
   * @returns Record of driver name to instance
   * @method
   */
  public static getAllDrivers(): Record<string, DriverBase> {
    return { ...DriverBase.registry }
  }

  /**
   * Initialize resources (e.g., connections, buffers).
   * Called once before processing any logs.
   * @abstract
   */
  public abstract initialize(): Promise<void>

  /**
   * Start the driver’s active processing (e.g., begin flushing batches).
   * After calling, isRunning() should return true.
   * @abstract
   */
  public abstract start(): Promise<void>

  /**
   * Process a single structured log record.
   * @param record The log entry with metadata and context.
   * @abstract
   */
  public abstract log(record: LogRecord): Promise<void>

  /**
   * Stop active processing (e.g., pause batches).
   * After calling, isRunning() should return false.
   * @abstract
   */
  public abstract stop(): Promise<void>

  /**
   * Shutdown the driver, flush pending logs, and release resources.
   * @abstract
   */
  public abstract shutdown(): Promise<void>

  /**
   * Enable this driver so it accepts new log records.
   * @method
   */
  public enable(): void {
    this.enabled = true
  }

  /**
   * Disable this driver; incoming logs will be ignored.
   * @method
   */
  public disable(): void {
    this.enabled = false
  }

  /**
   * Whether this driver is enabled.
   * @returns boolean
   * @method
   */
  public isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Whether the driver is currently running (i.e., started but not stopped).
   * @returns boolean
   * @method
   */
  public isRunning(): boolean {
    return this.running
  }

  /**
   * Internal helper for subclasses to update running state.
   * @param state true if running, false if stopped.
   * @protected
   */
  protected setRunning(state: boolean): void {
    this.running = state
  }
}
