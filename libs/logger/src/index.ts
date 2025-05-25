// libs/logger/src/index.ts

import { ConsoleDriver } from './lib/drivers/ConsoleDriver'
import { FileDriver } from './lib/drivers/FileDriver'
import { DriverBase } from './lib/DriverBase'

/**
 * @module LoggerRegistry
 * @description
 * Maintains the global registry of all logger drivers within Helix.
 * Provides APIs to register, retrieve, enable/disable, reload, and remove drivers.
 */

/**
 * A map of all registered logger drivers.
 * Keys are the unique driver names, values are the driver instances.
 * @internal
 * @type {Map<string, DriverBase>}
 */
const drivers = new Map<string, DriverBase>()

/**
 * Register a driver under a unique name.
 *
 * @function registerDriver
 * @param {string} name - Unique identifier for the driver.
 * @param {DriverBase} instance - Instance of a DriverBase subclass.
 * @throws {Error} If a driver with the same name is already registered.
 * @returns {void}
 */
export function registerDriver(name: string, instance: DriverBase): void {
  if (drivers.has(name)) {
    throw new Error(`Driver "${name}" is already registered`)
  }
  drivers.set(name, instance)
  instance.enable()
  // Note: initialize() and start() are deferred until first use or manual invocation.
}

/**
 * Retrieve a registered driver by its name.
 *
 * @function getDriver
 * @param {string} name - Identifier of the driver to retrieve.
 * @returns {(DriverBase | undefined)} The driver instance, or undefined if not found.
 */
export function getDriver(name: string): DriverBase | undefined {
  return drivers.get(name)
}

/**
 * Unregister (remove) a driver and perform its shutdown procedure.
 *
 * @function removeDriver
 * @param {string} name - Identifier of the driver to remove.
 * @returns {Promise<void>} Resolves once the driver has been shut down.
 */
export async function removeDriver(name: string): Promise<void> {
  const drv = drivers.get(name)
  if (!drv) return
  await drv.shutdown()
  drivers.delete(name)
}

/**
 * Enable an existing driver so it will accept incoming log records.
 *
 * @function enableDriver
 * @param {string} name - Identifier of the driver to enable.
 * @throws {Error} If no driver exists under the given name.
 * @returns {void}
 */
export function enableDriver(name: string): void {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  drv.enable()
}

/**
 * Disable an existing driver so it will ignore incoming log records.
 *
 * @function disableDriver
 * @param {string} name - Identifier of the driver to disable.
 * @throws {Error} If no driver exists under the given name.
 * @returns {void}
 */
export function disableDriver(name: string): void {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  drv.disable()
}

/**
 * Reload (re-initialize and restart) a driver by name.
 *
 * @function reloadDriver
 * @param {string} name - Identifier of the driver to reload.
 * @throws {Error} If no driver exists under the given name.
 * @returns {Promise<void>} Resolves once the driver has been shut down and restarted.
 */
export async function reloadDriver(name: string): Promise<void> {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  await drv.shutdown()
  await drv.initialize()
  await drv.start()
}

/**
 * Initialize the default set of drivers (Console and File).
 *
 * @async
 * @function initDefaults
 * @private
 * @returns {Promise<void>} Resolves once both default drivers are initialized and started.
 */
async function initDefaults(): Promise<void> {
  const consoleDrv = new ConsoleDriver()
  const fileDrv = new FileDriver({ filename: 'app.log' })

  registerDriver('console', consoleDrv)
  registerDriver('file', fileDrv)

  // Immediately initialize & start the default drivers
  await consoleDrv.initialize()
  await consoleDrv.start()
  await fileDrv.initialize()
  await fileDrv.start()
}

// Eagerly bootstrap defaults on module import
initDefaults().catch((err) => {
  // If default driver initialization fails, log the error to stderr
  console.error('Failed to init default log drivers', err)
})

/**
 * List all currently registered driver names.
 *
 * @function listDrivers
 * @returns {string[]} Array of driver identifiers.
 */
export function listDrivers(): string[] {
  return Array.from(drivers.keys())
}
