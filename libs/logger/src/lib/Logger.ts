// libs/logger/src/lib/Logger.ts

import winston from 'winston'
import { ConsoleDriver } from './drivers/ConsoleDriver'
import { FileDriver } from './drivers/FileDriver'
import type { DriverBase } from './DriverBase'
import type { LogRecord } from '../types/LogRecord'
import type { RouteRule } from '../types/RouteRule'

/**
 * @packageDocumentation
 *
 * Central orchestrator for logging within Helix.
 * Manages driver registration, dynamic routing rules,
 * and delegates log records to appropriate drivers.
 */

/**
 * Singleton Logger class.
 *
 * Provides methods to register drivers, update routing rules,
 * dispatch log records, handle driver errors, and perform graceful shutdown.
 *
 * @example
 * ```ts
 * import { logger } from '@helix/logger'
 *
 * logger.updateConfig([...rules])
 * logger.log({ timestamp: new Date().toISOString(), level: 'info', service: 'auth', message: 'User logged in' })
 * ```
 *
 * @public
 */
export class Logger {
  /** Internal singleton instance */
  private static _instance: Logger

  /** Registered drivers keyed by unique name */
  private drivers: Map<string, DriverBase> = new Map()

  /** In-memory routing rules */
  private rules: RouteRule[] = []

  /** Winston logger for internal fallback and error logging */
  private winstonLogger: winston.Logger

  /** Private constructor to enforce singleton pattern */
  private constructor() {
    // Initialize Winston for fallback console logging
    this.winstonLogger = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()],
    })

    // Register built-in drivers
    this.registerDriver('console', new ConsoleDriver())
    this.registerDriver('file', new FileDriver({ filename: 'app.log' }))
  }

  /**
   * Accessor for the singleton Logger instance.
   *
   * @returns The shared Logger instance.
   */
  public static get instance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger()
    }
    return Logger._instance
  }

  /**
   * Register and initialize a driver.
   *
   * @param name - Unique identifier for the driver instance.
   * @param driver - Concrete DriverBase subclass instance.
   */
  public registerDriver(name: string, driver: DriverBase): void {
    if (this.drivers.has(name)) {
      throw new Error(`Driver "${name}" is already registered`)
    }
    this.drivers.set(name, driver)
    driver
      .initialize()
      .then(() => driver.start())
      .catch((err) => this.handleDriverError(name, err as Error))
  }

  /**
   * Update routing rules at runtime.
   *
   * @remarks
   * New rules take effect immediately for subsequent log calls.
   *
   * @param rules - Array of {@link RouteRule} defining routing behavior.
   */
  public updateConfig(rules: RouteRule[]): void {
    this.rules = rules
    // TODO: emit config reload event if needed
  }

  /**
   * Dispatch a log record to matching drivers based on rules.
   *
   * @param record - Structured log entry to process.
   */
  public async log(record: LogRecord): Promise<void> {
    // Route via first-matching rule
    for (const rule of this.rules) {
      if (!rule.enabled) continue
      // TODO: apply glob/level matching logic
      for (const driverName of rule.drivers) {
        const drv = this.drivers.get(driverName)
        if (drv?.isEnabled() && drv.isRunning()) {
          try {
            await drv.log(record)
          } catch (err) {
            this.handleDriverError(driverName, err as Error)
          }
        }
      }
      break // first-match wins
    }
    // Always send to console driver as fallback
    const consoleDrv = this.drivers.get('console')
    if (consoleDrv && consoleDrv.isEnabled() && consoleDrv.isRunning()) {
      await consoleDrv.log(record)
    }
  }

  /**
   * Internal error handler for driver failures.
   *
   * Performs fallback via Winston and triggers retry/fallback hooks.
   *
   * @param name - Name of the driver that errored.
   * @param error - Error thrown by the driver.
   */
  private handleDriverError(name: string, error: Error): void {
    this.winstonLogger.error(`Driver "${name}" error: ${error.message}`)
    // TODO: emit onDriverError callback, retry with backoff, etc.
  }

  /**
   * Gracefully shuts down all registered drivers,
   * ensuring pending logs are flushed.
   */
  public async shutdown(): Promise<void> {
    for (const [name, drv] of this.drivers) {
      try {
        await drv.shutdown()
      } catch (err) {
        this.handleDriverError(name, err as Error)
      }
    }
  }
}

/**
 * Exported singleton instance for direct import.
 *
 * @example
 * ```ts
 * import { logger } from '@helix/logger'
 *
 * logger.log({ ... })
 * ```
 */
export const logger = Logger.instance
