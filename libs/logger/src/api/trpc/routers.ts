// libs/logger/src/api/trpc/routers.ts

import { initTRPC } from '@trpc/server'
import type { Context } from './context'
import * as handlers from './handlers'
import type { RouteRule } from '../../types/RouteRule'
import { z } from 'zod'

const t = initTRPC.context<Context>().create()

/**
 * tRPC router for logger configuration and driver management.
 * Exposes a set of procedures to query and mutate routing rules and drivers.
 *
 * @module routers
 */
export const loggerRouter = t.router({
  /**
   * **getAllRules**
   *
   * Retrieves the full list of routing rules from the configuration service.
   *
   * @procedure
   * @name getAllRules
   * @returns {Promise<RouteRule[]>} Resolves with an array of all `RouteRule` objects.
   */
  getAllRules: t.procedure
    .meta({ description: 'Fetch all routing rules' })
    .query(async (): Promise<RouteRule[]> => {
      return handlers.getAllRules()
    }),

  /**
   * **getRule**
   *
   * Fetches a single routing rule by its unique identifier.
   *
   * @procedure
   * @name getRule
   * @input {string} id - The unique identifier of the rule.
   * @returns {Promise<RouteRule | undefined>} Resolves with the found `RouteRule`, or `undefined` if not found.
   */
  getRule: t.procedure
    .meta({ description: 'Fetch a routing rule by ID' })
    .input(z.string().describe('Rule ID to retrieve'))
    .query(async ({ input: id }): Promise<RouteRule | undefined> => {
      return handlers.getRule(id)
    }),

  /**
   * **addRule**
   *
   * Adds a new routing rule to the configuration.
   *
   * @procedure
   * @name addRule
   * @input {RouteRule} rule - The `RouteRule` object to add.
   * @returns {Promise<void>} Resolves when the rule has been persisted.
   */
  addRule: t.procedure
    .meta({ description: 'Create a new routing rule' })
    .input(
      z
        .object({
          id: z.string().uuid().describe('Unique UUID for the new rule'),
          enabled: z.boolean().describe('Whether the rule is active'),
          description: z.string().describe('Human-readable rule description'),
          pattern: z.string().optional().describe('Glob pattern for matching category'),
          levels: z.array(z.enum(['info','warn','error','debug','trace','fatal','success'])).optional().describe('Applicable log levels'),
          drivers: z.array(z.string()).describe('Target driver names to route to'),
        })
        .describe('RouteRule object to add'),
    )
    .mutation(async ({ input: rule }): Promise<void> => {
      await handlers.addRule(rule)
    }),

  /**
   * **updateRule**
   *
   * Applies partial updates to an existing routing rule.
   *
   * @procedure
   * @name updateRule
   * @input {{ id: string; updates: Partial<RouteRule> }} args
   * @param {string} args.id - Identifier of the rule to update.
   * @param {Partial<RouteRule>} args.updates - Fields to update on the rule.
   * @returns {Promise<void>} Resolves when update is complete.
   */
  updateRule: t.procedure
    .meta({ description: 'Modify an existing routing rule' })
    .input(
      z
        .object({
          id: z.string().uuid().describe('ID of the rule to modify'),
          updates: z
            .object({
              enabled: z.boolean().optional(),
              description: z.string().optional(),
              pattern: z.string().optional(),
              levels: z.array(z.enum(['info','warn','error','debug','trace','fatal','success'])).optional(),
              drivers: z.array(z.string()).optional(),
            })
            .partial()
            .describe('Fields to update on the rule'),
        })
        .describe('Update arguments'),
    )
    .mutation(async ({ input: { id, updates } }): Promise<void> => {
      await handlers.updateRule(id, updates)
    }),

  /**
   * **removeRule**
   *
   * Deletes a routing rule by its ID.
   *
   * @procedure
   * @name removeRule
   * @input {string} id - The identifier of the rule to remove.
   * @returns {Promise<void>} Resolves when deletion is complete.
   */
  removeRule: t.procedure
    .meta({ description: 'Delete a routing rule by ID' })
    .input(z.string().uuid().describe('ID of the rule to delete'))
    .mutation(async ({ input: id }): Promise<void> => {
      await handlers.removeRule(id)
    }),

  /**
   * **updateConfig**
   *
   * Atomically replaces the entire routing configuration with a new set.
   *
   * @procedure
   * @name updateConfig
   * @input {RouteRule[]} newRules - Array of new routing rules to apply.
   * @returns {Promise<void>} Resolves when replacement is complete.
   */
  updateConfig: t.procedure
    .meta({ description: 'Overwrite routing configuration' })
    .input(
      z
        .array(
          z.object({
            id: z.string().uuid(),
            enabled: z.boolean(),
            description: z.string(),
            pattern: z.string().optional(),
            levels: z
              .array(z.enum(['info','warn','error','debug','trace','fatal','success']))
              .optional(),
            drivers: z.array(z.string()),
          }),
        )
        .describe('New array of RouteRule objects'),
    )
    .mutation(async ({ input: newRules }): Promise<void> => {
      await handlers.updateConfig(newRules)
    }),

  /**
   * **reloadConfig**
   *
   * Reloads the routing rules from persistent storage (database).
   *
   * @procedure
   * @name reloadConfig
   * @returns {Promise<void>} Resolves when the rules have been reloaded.
   */
  reloadConfig: t.procedure
    .meta({ description: 'Reload routing rules from DB' })
    .mutation(async (): Promise<void> => {
      await handlers.reloadConfig()
    }),

  /**
   * **reloadDriver**
   *
   * Triggers a hot-reload of a specific driver instance by name.
   *
   * @procedure
   * @name reloadDriver
   * @input {string} name - The name of the driver to reload.
   * @returns {Promise<void>} Resolves once reload command is issued.
   */
  reloadDriver: t.procedure
    .meta({ description: 'Reload a specific driver' })
    .input(z.string().describe('Driver name to reload'))
    .mutation(async ({ input: name }): Promise<void> => {
      await handlers.reloadDriver(name)
    }),

  /**
   * **addDriver**
   *
   * Registers a brand-new driver instance under the given name.
   *
   * @procedure
   * @name addDriver
   * @input {{ name: string; instance: unknown }} payload
   * @param {string} payload.name - Identifier under which to register the instance.
   * @param {unknown} payload.instance - The driver instance object (must extend DriverBase).
   * @returns {Promise<void>} Resolves when registration is complete.
   */
  addDriver: t.procedure
    .meta({ description: 'Register a new logger driver' })
    .input(
      z
        .object({
          name: z.string().describe('Unique name for the new driver'),
          instance: z.any().describe('Driver instance (DriverBase subclass)'),
        })
        .describe('Driver registration payload'),
    )
    .mutation(async ({ input: { name, instance } }): Promise<void> => {
      handlers.addDriver(name, instance as any)
    }),

  /**
   * **enableDriver**
   *
   * Enables an existing registered driver so it begins accepting log records.
   *
   * @procedure
   * @name enableDriver
   * @input {string} name - The identifier of the driver to enable.
   * @returns {Promise<void>} Resolves once the driver is enabled.
   */
  enableDriver: t.procedure
    .meta({ description: 'Enable a registered driver' })
    .input(z.string().describe('Driver name to enable'))
    .mutation(async ({ input: name }): Promise<void> => {
      handlers.enableDriver(name)
    }),

  /**
   * **disableDriver**
   *
   * Disables an existing driver so it ignores incoming log records.
   *
   * @procedure
   * @name disableDriver
   * @input {string} name - The identifier of the driver to disable.
   * @returns {Promise<void>} Resolves once the driver is disabled.
   */
  disableDriver: t.procedure
    .meta({ description: 'Disable a registered driver' })
    .input(z.string().describe('Driver name to disable'))
    .mutation(async ({ input: name }): Promise<void> => {
      handlers.disableDriver(name)
    }),

  /**
   * **removeDriver**
   *
   * Unregisters (and shuts down) a driver by name.
   *
   * @procedure
   * @name removeDriver
   * @input {string} name - The identifier of the driver to remove.
   * @returns {Promise<void>} Resolves once removal is complete.
   */
  removeDriver: t.procedure
    .meta({ description: 'Unregister a driver and shut it down' })
    .input(z.string().describe('Driver name to remove'))
    .mutation(async ({ input: name }): Promise<void> => {
      handlers.removeDriver(name)
    }),
})
