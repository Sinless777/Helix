// libs/logger/src/api/trpc/handlers.ts

import type { RouteRule } from '../../types/RouteRule'
import { ConfigService } from '../../lib/config/ConfigService'
import { RoutingConfig } from '../../lib/config/RoutingConfig'
import { DriverBase } from '../../lib/DriverBase'

/**
 * Singleton service that persists encrypted routing rules.
 * Initialized elsewhere and imported here.
 */
const configService = new ConfigService({} as any)

/**
 * In-memory router that applies rules to log streams
 * and emits driver reload events.
 */
const routingConfig = new RoutingConfig(configService)

/**
 * Retrieve all routing rules.
 *
 * @returns Array of all configured RouteRule objects
 */
export async function getAllRules(): Promise<RouteRule[]> {
  return configService.getRules()
}

/**
 * Find a routing rule by its ID.
 *
 * @param id - The unique identifier of the rule
 * @returns The matching RouteRule, or undefined if not found
 */
export async function getRule(id: string): Promise<RouteRule | undefined> {
  return configService.getRules().find((r) => r.id === id)
}

/**
 * Add a new routing rule to the configuration.
 *
 * @param rule - The RouteRule to add
 */
export async function addRule(rule: RouteRule): Promise<void> {
  await configService.addRule(rule)
}

/**
 * Update fields on an existing routing rule.
 *
 * @param id - The ID of the rule to update
 * @param updates - Partial fields to merge into the rule
 */
export async function updateRule(
  id: string,
  updates: Partial<RouteRule>,
): Promise<void> {
  await configService.updateRule(id, updates)
}

/**
 * Remove a routing rule by its ID.
 *
 * @param id - The ID of the rule to remove
 */
export async function removeRule(id: string): Promise<void> {
  await configService.removeRule(id)
}

/**
 * Reload routing rules from persistent storage.
 */
export async function reloadConfig(): Promise<void> {
  await routingConfig.reloadConfig()
}

/**
 * Replace the entire routing configuration.
 *
 * @param newRules - The complete new set of RouteRule objects
 */
export async function updateConfig(newRules: RouteRule[]): Promise<void> {
  await routingConfig.updateConfig(newRules)
}

/**
 * Trigger a reload (shutdown & re-init) of the named driver.
 *
 * @param name - The driver identifier to reload
 */
export function reloadDriver(name: string): void {
  routingConfig.reloadDriver(name)
}

/**
 * Register a new driver instance by name.
 *
 * @param name - Unique identifier for the driver
 * @param instance - DriverBase subclass instance
 */
export function addDriver(name: string, instance: DriverBase): void {
  DriverBase.registerDriver(name, instance)
}

/**
 * Enable a registered driver so it starts accepting log records.
 *
 * @param name - The driver identifier to enable
 */
export function enableDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (!driver) throw new Error(`Driver not found: ${name}`)
  driver.enable()
}

/**
 * Disable a registered driver so it ignores log records.
 *
 * @param name - The driver identifier to disable
 */
export function disableDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (!driver) throw new Error(`Driver not found: ${name}`)
  driver.disable()
}

/**
 * Unregister and shut down a driver instance by name.
 *
 * @param name - The driver identifier to remove
 */
export function removeDriver(name: string): void {
  const driver = DriverBase.getDriver(name)
  if (driver) {
    driver.shutdown().catch((err) => {
      console.error(`Error shutting down driver "${name}":`, err)
    })
  }
}
