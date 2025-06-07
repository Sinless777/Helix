// libs/logger/src/lib/DriverBase.ts

import type { LogRecord } from '../types/LogRecord'

/**
 * Abstract base for all Helix Logger drivers.
 *
 * Provides lifecycle hooks (initialize, start, log, stop, shutdown)
 * and enable/disable controls. Also maintains a static registry of
 * all named driver instances.
 *
 * @internal
 */
export abstract class DriverBase {
  /**
   * Invoked when the driver encounters an error.
   * Subclasses can override to customize handling.
   *
   * @param error - The error thrown by driver operations.
   */
  public onError(error: Error): void {
    throw new Error('Method not implemented.')
  }

  private enabled = false
  private running = false

  /**
   * Static map of registered driver instances.
   * Keys are unique driver names.
   */
  private static registry: Record<string, DriverBase> = {}

  /**
   * Registers a driver under a unique name.
   *
   * @param name - Unique identifier for this driver.
   * @param instance - The DriverBase instance to register.
   * @throws If a driver with the same name already exists.
   */
  public static registerDriver(name: string, instance: DriverBase): void {
    if (DriverBase.registry[name]) {
      throw new Error(`Driver "${name}" is already registered`)
    }
    DriverBase.registry[name] = instance
  }

  /**
   * Retrieves a registered driver by name.
   *
   * @param name - Identifier of the driver.
   * @returns The driver instance, or undefined if not found.
   */
  public static getDriver(name: string): DriverBase | undefined {
    return DriverBase.registry[name]
  }

  /**
   * Returns all registered drivers.
   *
   * @returns A shallow copy of the registry.
   */
  public static getAllDrivers(): Record<string, DriverBase> {
    return { ...DriverBase.registry }
  }

  /**
   * Prepare the driver (e.g., open connections, allocate resources).
   *
   * @returns Resolves when initialization is complete.
   */
  public abstract initialize(): Promise<void>

  /**
   * Begin processing (e.g., start flush intervals, listeners).
   *
   * After this, `isRunning()` must return true.
   *
   * @returns Resolves when the driver is actively running.
   */
  public abstract start(): Promise<void>

  /**
   * Handle a single log record.
   *
   * @param record - The structured log entry.
   * @returns Resolves when this record has been written or dispatched.
   */
  public abstract log(record: LogRecord): Promise<void>

  /**
   * Pause active processing (e.g., stop timers or listeners).
   *
   * After this, `isRunning()` must return false.
   *
   * @returns Resolves when processing has stopped.
   */
  public abstract stop(): Promise<void>

  /**
   * Fully shut down the driver, flushing any remaining data
   * and releasing resources.
   *
   * @returns Resolves once shutdown is complete.
   */
  public abstract shutdown(): Promise<void>

  /**
   * Enable this driver to accept new records.
   */
  public enable(): void {
    this.enabled = true
  }

  /**
   * Disable this driver so incoming records are ignored.
   */
  public disable(): void {
    this.enabled = false
  }

  /**
   * Check if this driver is enabled.
   *
   * @returns True if enabled.
   */
  public isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Check if this driver is actively running.
   *
   * @returns True if `start()` has been called without a subsequent `stop()`.
   */
  public isRunning(): boolean {
    return this.running
  }

  /**
   * Update the internal running state.
   * Subclasses should call this when they begin or end processing.
   *
   * @param state - True to mark as running; false to mark as stopped.
   */
  protected setRunning(state: boolean): void {
    this.running = state
  }
}
