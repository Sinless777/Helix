// libs/logger/src/index.ts

import { ConsoleDriver } from './lib/drivers/ConsoleDriver'
import { FileDriver } from './lib/drivers/FileDriver'
import { DriverBase } from './lib/DriverBase'

/**
 * A map of all registered logger drivers.
 * Keys are the unique driver names, values are the driver instances.
 * @internal
 */
const drivers = new Map<string, DriverBase>()

/**
 * Registers a new driver under the given name.
 * If a driver with the same name already exists, an error is thrown.
 *
 * @param name - Unique identifier for the driver.
 * @param instance - Instance of a DriverBase subclass.
 * @throws Will throw if a driver with the same name is already registered.
 */
export function registerDriver(name: string, instance: DriverBase): void {
  if (drivers.has(name)) {
    throw new Error(`Driver "${name}" is already registered`)
  }
  drivers.set(name, instance)
  instance.enable()
  // Note: initialize() and start() happen lazily on first log (or can be invoked manually)
}

/**
 * Retrieves a registered driver by its name.
 *
 * @param name - Identifier of the driver to retrieve.
 * @returns The driver instance, or `undefined` if no driver is registered under that name.
 */
export function getDriver(name: string): DriverBase | undefined {
  return drivers.get(name)
}

/**
 * Unregisters (removes) a driver and performs its shutdown procedure.
 *
 * @param name - Identifier of the driver to remove.
 * @returns A promise that resolves once the driver has been shut down.
 */
export async function removeDriver(name: string): Promise<void> {
  const drv = drivers.get(name)
  if (!drv) return
  await drv.shutdown()
  drivers.delete(name)
}

/**
 * Enables an already-registered driver so it will start processing log records.
 *
 * @param name - Identifier of the driver to enable.
 * @throws Will throw if no driver exists under the given name.
 */
export function enableDriver(name: string): void {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  drv.enable()
}

/**
 * Disables an already-registered driver so it will ignore incoming log records.
 *
 * @param name - Identifier of the driver to disable.
 * @throws Will throw if no driver exists under the given name.
 */
export function disableDriver(name: string): void {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  drv.disable()
}

/**
 * Completely reloads the specified driver by shutting it down
 * and then re-initializing and restarting it.
 *
 * @param name - Identifier of the driver to reload.
 * @returns A promise that resolves once the driver has been reloaded.
 * @throws Will throw if no driver exists under the given name.
 */
export async function reloadDriver(name: string): Promise<void> {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  await drv.shutdown()
  await drv.initialize()
  await drv.start()
}

/**
 * Bootstraps the default set of drivers (Console and File).
 * Called automatically on module load.
 *
 * @internal
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

// Immediately initialize defaults on import
initDefaults().catch((err) => {
  // If initialization fails, we fallback to stderr
  console.error('Failed to init default log drivers', err)
})

/**
 * Returns the list of all registered driver names.
 *
 * @returns An array of driver names.
 */
export function listDrivers(): string[] {
  return Array.from(drivers.keys())
}
