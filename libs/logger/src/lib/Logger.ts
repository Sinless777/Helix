import winston from 'winston'
import { ConsoleDriver } from './drivers/ConsoleDriver'
import { FileDriver } from './drivers/FileDriver'
import type { DriverBase } from './DriverBase'
import type { LogRecord } from '../types/LogRecord'
import type { RouteRule } from '../types/RouteRule'

/**
 * Central Logger orchestrator for Helix.
 * Manages drivers, routing rules, and delegates log records.
 */
export class Logger {
  private static _instance: Logger
  private drivers: Map<string, DriverBase> = new Map()
  private rules: RouteRule[] = []
  private winstonLogger: winston.Logger

  private constructor() {
    // Winston core for fallback/console formatting
    this.winstonLogger = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()],
    })
    // Register default drivers
    this.registerDriver('console', new ConsoleDriver())
    this.registerDriver('file', new FileDriver({ filename: 'app.log' }))
  }

  /**
   * Retrieve singleton instance.
   */
  public static get instance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger()
    }
    return Logger._instance
  }

  /**
   * Register a new driver by name.
   * @param name Unique driver identifier
   * @param driver DriverBase instance
   */
  public registerDriver(name: string, driver: DriverBase): void {
    this.drivers.set(name, driver)
    driver.initialize().catch((err) => this.handleDriverError(name, err))
  }

  /**
   * Update routing rules at runtime.
   * @param rules Array of RouteRule
   */
  public updateConfig(rules: RouteRule[]): void {
    this.rules = rules
    // Optionally, notify drivers of config reload
  }

  /**
   * Log a record, routing to matching drivers.
   * @param record LogRecord to process
   */
  public async log(record: LogRecord): Promise<void> {
    for (const rule of this.rules) {
      if (!rule.enabled) continue
      // simple glob/level matching omitted for brevity
      for (const driverName of rule.drivers) {
        const drv = this.drivers.get(driverName)
        if (drv && drv.isEnabled() && drv.isRunning()) {
          try {
            await drv.log(record)
          } catch (err) {
            this.handleDriverError(driverName, err as Error)
          }
        }
      }
      // first-match wins
      break
    }
    // Always log to console
    await this.drivers.get('console')?.log(record)
  }

  /**
   * Handle driver-level errors: retry logic or fallback.
   * @param name Driver name
   * @param error Error instance
   */
  private handleDriverError(name: string, error: Error): void {
    this.winstonLogger.error(`Driver "${name}" error: ${error.message}`)
    // emit callback/event, retry/backoff as needed
  }

  /**
   * Gracefully shutdown all drivers.
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

// Export the singleton
export const logger = Logger.instance
