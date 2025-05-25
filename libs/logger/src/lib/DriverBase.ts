// libs/logger/src/lib/DriverBase.ts

import type { LogRecord } from '../types/LogRecord'

/**
 * Base abstract class for all HelixLogger drivers.
 * Defines lifecycle methods, enable/disable controls, and a static registry for driver instances.
 *
 * @class
 */
export abstract class DriverBase {
  /**
   * Called when the driver encounters an error during operation.
   * Subclasses may override to implement custom error handling.
   *
   * @param error - The Error instance thrown by the driver.
   */
  public onError(error: Error): void {
    throw new Error('Method not implemented.')
  }

  /** Whether this driver is enabled (accepts new logs). */
  private enabled = false

  /** Whether this driver is actively running (started but not stopped). */
  private running = false

  /**
   * Static registry mapping driver names to instances.
   *
   * @internal
   * @static
   * @property
   */
  private static registry: Record<string, DriverBase> = {}

  /**
   * Register a driver instance under a unique name.
   *
   * @static
   * @method
   * @param name - Unique identifier for the driver
   * @param instance - Instance of DriverBase
   */
  public static registerDriver(name: string, instance: DriverBase): void {
    if (DriverBase.registry[name]) {
      throw new Error(`Driver "${name}" is already registered`)
    }
    DriverBase.registry[name] = instance
  }

  /**
   * Retrieve a previously registered driver by name.
   *
   * @static
   * @method
   * @param name - Identifier of the driver
   * @returns The driver instance or undefined if not found
   */
  public static getDriver(name: string): DriverBase | undefined {
    return DriverBase.registry[name]
  }

  /**
   * Retrieve all registered drivers.
   *
   * @static
   * @method
   * @returns A shallow copy of the driver registry
   */
  public static getAllDrivers(): Record<string, DriverBase> {
    return { ...DriverBase.registry }
  }

  /**
   * Initialize resources (e.g., connections, buffers).
   * Called once before any logs are processed.
   *
   * @abstract
   * @method
   * @returns A promise that resolves when initialization is complete.
   */
  public abstract initialize(): Promise<void>

  /**
   * Start the driver's active processing (e.g., begin flushing batches).
   * After calling, {@link isRunning} should return true.
   *
   * @abstract
   * @method
   * @returns A promise that resolves when the driver has started.
   */
  public abstract start(): Promise<void>

  /**
   * Process a single structured log record.
   *
   * @abstract
   * @method
   * @param record - The log entry with metadata and context
   * @returns A promise that resolves when the log has been handled.
   */
  public abstract log(record: LogRecord): Promise<void>

  /**
   * Stop active processing (e.g., pause batch flushing).
   * After calling, {@link isRunning} should return false.
   *
   * @abstract
   * @method
   * @returns A promise that resolves when the driver has stopped.
   */
  public abstract stop(): Promise<void>

  /**
   * Shutdown the driver, flush pending logs, and release resources.
   *
   * @abstract
   * @method
   * @returns A promise that resolves when shutdown is complete.
   */
  public abstract shutdown(): Promise<void>

  /**
   * Enable this driver so it will accept new log records.
   *
   * @method
   */
  public enable(): void {
    this.enabled = true
  }

  /**
   * Disable this driver; incoming logs will be ignored.
   *
   * @method
   */
  public disable(): void {
    this.enabled = false
  }

  /**
   * Check whether this driver is enabled.
   *
   * @method
   * @returns True if enabled, false otherwise.
   */
  public isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Check whether the driver is currently running.
   *
   * @method
   * @returns True if started and not stopped.
   */
  public isRunning(): boolean {
    return this.running
  }

  /**
   * Update the internal running state.
   * Subclasses should call this when they start/stop processing.
   *
   * @protected
   * @method
   * @param state - True if running, false if stopped.
   */
  protected setRunning(state: boolean): void {
    this.running = state
  }
}
