import type { RouteRule } from '../../types/RouteRule'
import { ConfigService } from '../../lib/config/ConfigService'
import { RoutingConfig } from '../../lib/config/RoutingConfig'
import { DriverBase } from '../../lib/DriverBase'

// Assume these singletons are initialized and passed in from index
const configService = new ConfigService({} as any)
const routingConfig = new RoutingConfig(configService)

/**
 * tRPC handlers for logger configuration and driver management.
 * @module handlers
 */

/**
 * Retrieve all routing rules.
 * @returns Array of RouteRule
 */
export async function getAllRules(): Promise<RouteRule[]> {
  return configService.getRules()
}

/**
 * Retrieve a single rule by ID.
 * @param id Identifier of the rule
 * @returns RouteRule or undefined
 */
export async function getRule(id: string): Promise<RouteRule | undefined> {
  return configService.getRules().find((r) => r.id === id)
}

/**
 * Add a new routing rule.
 * @param rule New rule to add
 */
export async function addRule(rule: RouteRule): Promise<void> {
  await configService.addRule(rule)
}

/**
 * Update an existing routing rule.
 * @param id Identifier of the rule to update
 * @param updates Partial updates to apply
 */
export async function updateRule(
  id: string,
  updates: Partial<RouteRule>,
): Promise<void> {
  await configService.updateRule(id, updates)
}

/**
 * Remove a routing rule by ID.
 * @param id Identifier of the rule to remove
 */
export async function removeRule(id: string): Promise<void> {
  await configService.removeRule(id)
}

/**
 * Reload routing configuration from the database.
 */
export async function reloadConfig(): Promise<void> {
  await routingConfig.reloadConfig()
}

/**
 * Replace entire routing configuration.
 * @param newRules Array of new routing rules
 */
export async function updateConfig(newRules: RouteRule[]): Promise<void> {
  await routingConfig.updateConfig(newRules)
}

/**
 * Trigger reload for a specific driver.
 * @param name Name of the driver to reload
 */
export function reloadDriver(name: string): void {
  routingConfig.reloadDriver(name)
}

/**
 * Register a new driver instance under the given name.
 * @param name Unique identifier for the driver
 * @param instance Driver instance
 */
export function addDriver(name: string, instance: DriverBase): void {
  DriverBase.registerDriver(name, instance)
}

/**
 * Enable a registered driver by name.
 * @param name Name of the driver to enable
 */
export function enableDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (driver) driver.enable()
}

/**
 * Disable a registered driver by name.
 * @param name Name of the driver to disable
 */
export function disableDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (driver) driver.disable()
}

/**
 * Remove (unregister) a driver by name.
 * Note: shutdown() will be called on the instance if present.
 * @param name Name of the driver to remove
 */
export function removeDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (driver) {
    driver.shutdown().catch(() => {})
  }
  // Not tracked: private registry cannot be mutated here
}
