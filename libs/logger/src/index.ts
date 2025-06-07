// libs/logger/src/index.ts

import { ConsoleDriver } from './lib/drivers/ConsoleDriver'
import { FileDriver } from './lib/drivers/FileDriver'
import { DriverBase } from './lib/DriverBase'

/**
 * Maintains the global registry of all logger drivers.
 * Provides APIs to register, retrieve, enable/disable, reload, and remove drivers.
 * @internal
 */
const drivers = new Map<string, DriverBase>()

/**
 * Register a driver under a unique name.
 *
 * @param name - Unique identifier for the driver.
 * @param instance - Instance of a DriverBase subclass.
 * @throws Error if a driver with the same name is already registered.
 */
export function registerDriver(name: string, instance: DriverBase): void {
  if (drivers.has(name)) {
    throw new Error(`Driver "${name}" is already registered`)
  }
  drivers.set(name, instance)
  instance.enable()
  // initialize() and start() are deferred until first use or manual invocation
}

/**
 * Retrieve a registered driver by its name.
 *
 * @param name - Identifier of the driver to retrieve.
 * @returns The driver instance, or undefined if not found.
 */
export function getDriver(name: string): DriverBase | undefined {
  return drivers.get(name)
}

/**
 * Unregister (remove) a driver and perform its shutdown procedure.
 *
 * @param name - Identifier of the driver to remove.
 */
export async function removeDriver(name: string): Promise<void> {
  const drv = drivers.get(name)
  if (!drv) return
  await drv.shutdown()
  drivers.delete(name)
}

/**
 * Enable a registered driver so it will accept log records.
 *
 * @param name - Identifier of the driver to enable.
 * @throws Error if no driver exists under the given name.
 */
export function enableDriver(name: string): void {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  drv.enable()
}

/**
 * Disable a registered driver so it will ignore log records.
 *
 * @param name - Identifier of the driver to disable.
 * @throws Error if no driver exists under the given name.
 */
export function disableDriver(name: string): void {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  drv.disable()
}

/**
 * Reload (shutdown, re-initialize, and restart) a driver.
 *
 * @param name - Identifier of the driver to reload.
 * @throws Error if no driver exists under the given name.
 */
export async function reloadDriver(name: string): Promise<void> {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`No such driver "${name}"`)
  await drv.shutdown()
  await drv.initialize()
  await drv.start()
}

/**
 * Immediately bootstrap the default Console and File drivers on import.
 * Logs errors to stderr if initialization fails.
 * @internal
 */
async function initDefaults(): Promise<void> {
  const consoleDrv = new ConsoleDriver()
  const fileDrv = new FileDriver({ filename: 'app.log' })

  registerDriver('console', consoleDrv)
  registerDriver('file', fileDrv)

  try {
    await consoleDrv.initialize()
    await consoleDrv.start()
    await fileDrv.initialize()
    await fileDrv.start()
  } catch (err) {
    console.error('Failed to init default log drivers', err)
  }
}

initDefaults()

/**
 * List all currently registered driver names.
 *
 * @returns An array of driver identifiers.
 */
export function listDrivers(): string[] {
  return Array.from(drivers.keys())
}
