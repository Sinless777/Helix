// libs/logger/src/api/trpc/handlers.ts

import type { RouteRule } from '../../types/RouteRule'
import { ConfigService } from '../../lib/config/ConfigService'
import { RoutingConfig } from '../../lib/config/RoutingConfig'
import { DriverBase } from '../../lib/DriverBase'

/**
 * Singleton instance of ConfigService managing encrypted persistence of RouteRule entities.
 * Initialized elsewhere and imported here.
 * @internal
 */
const configService = new ConfigService({} as any)

/**
 * Singleton instance of RoutingConfig that applies loaded RouteRule objects
 * to incoming LogRecord streams and emits driver reload events.
 * @internal
 */
const routingConfig = new RoutingConfig(configService)

/**
 * tRPC handler module for logger configuration and driver lifecycle management.
 * @module handlers
 */

/**
 * Fetches all routing rules currently stored in the configuration service.
 * @async
 * @function getAllRules
 * @returns {Promise<RouteRule[]>} Array of all `RouteRule` objects.
 */
export async function getAllRules(): Promise<RouteRule[]> {
  return configService.getRules()
}

/**
 * Retrieves a single routing rule by its unique identifier.
 * @async
 * @function getRule
 * @param {string} id - The unique ID of the rule to look up.
 * @returns {Promise<RouteRule | undefined>} The matching `RouteRule`, or `undefined` if not found.
 */
export async function getRule(id: string): Promise<RouteRule | undefined> {
  return configService.getRules().find((r) => r.id === id)
}

/**
 * Adds a new routing rule into the persistent configuration.
 * Emits a `ruleAdded` event on success.
 * @async
 * @function addRule
 * @param {RouteRule} rule - The new routing rule to persist.
 * @returns {Promise<void>}
 */
export async function addRule(rule: RouteRule): Promise<void> {
  await configService.addRule(rule)
}

/**
 * Applies partial updates to an existing routing rule, identified by ID.
 * Emits a `ruleUpdated` event with the merged rule.
 * @async
 * @function updateRule
 * @param {string} id - Unique identifier of the rule to update.
 * @param {Partial<RouteRule>} updates - Fields to merge into the existing rule.
 * @returns {Promise<void>}
 * @throws {Error} if no rule with the given `id` exists.
 */
export async function updateRule(
  id: string,
  updates: Partial<RouteRule>,
): Promise<void> {
  await configService.updateRule(id, updates)
}

/**
 * Deletes a routing rule from the configuration by its ID.
 * Emits a `ruleRemoved` event on removal.
 * @async
 * @function removeRule
 * @param {string} id - Unique identifier of the rule to delete.
 * @returns {Promise<void>}
 */
export async function removeRule(id: string): Promise<void> {
  await configService.removeRule(id)
}

/**
 * Forces a reload of routing rules from the underlying database,
 * updating the in-memory set and emitting `rulesUpdated`.
 * @async
 * @function reloadConfig
 * @returns {Promise<void>}
 */
export async function reloadConfig(): Promise<void> {
  await routingConfig.reloadConfig()
}

/**
 * Replaces the entire routing configuration atomically.
 * Deletes all existing rules, persists the given `newRules`, and emits `configReplaced`.
 * @async
 * @function updateConfig
 * @param {RouteRule[]} newRules - The complete set of routing rules to apply.
 * @returns {Promise<void>}
 */
export async function updateConfig(newRules: RouteRule[]): Promise<void> {
  await routingConfig.updateConfig(newRules)
}

/**
 * Triggers a reload (shutdown & re-init) of the named driver instance.
 * Emits a `driverReload` event for external hooks (e.g., reconnect).
 * @function reloadDriver
 * @param {string} name - The identifier of the driver to reload.
 */
export function reloadDriver(name: string): void {
  routingConfig.reloadDriver(name)
}

/**
 * Registers a new driver instance under a unique name in the global registry.
 * @function addDriver
 * @param {string} name - Unique identifier for the driver.
 * @param {DriverBase} instance - DriverBase subclass instance to register.
 */
export function addDriver(name: string, instance: DriverBase): void {
  DriverBase.registerDriver(name, instance)
}

/**
 * Enables a named driver so it will accept and process incoming log records.
 * @function enableDriver
 * @param {string} name - The driver’s unique identifier.
 * @throws {Error} if no driver with the given name is registered.
 */
export function enableDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (!driver) throw new Error(`Driver not found: ${name}`)
  driver.enable()
}

/**
 * Disables a named driver so it will ignore any future log records.
 * @function disableDriver
 * @param {string} name - The driver’s unique identifier.
 * @throws {Error} if no driver with the given name is registered.
 */
export function disableDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (!driver) throw new Error(`Driver not found: ${name}`)
  driver.disable()
}

/**
 * Unregisters (and shuts down) a named driver instance.
 * Calls `shutdown()` on the instance before removal.
 * @function removeDriver
 * @param {string} name - The driver’s unique identifier.
 */
export function removeDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (driver) {
    driver.shutdown().catch((err) => {
      // swallow errors on shutdown
      console.error(`Error shutting down driver "${name}":`, err)
    })
  }
}
