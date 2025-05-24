import { initTRPC } from '@trpc/server'
import type { Context } from './context'
import * as handlers from './handlers'
import type { RouteRule } from '../../types/RouteRule'
import { z } from 'zod'

const t = initTRPC.context<Context>().create()

/**
 * tRPC router for logger configuration and driver management.
 * Defines the available procedures for client consumption.
 * @module routers
 */
export const loggerRouter = t.router({
  /**
   * Retrieve all routing rules.
   * @returns Array of RouteRule objects
   */
  getAllRules: t.procedure.query(async (): Promise<RouteRule[]> => {
    return handlers.getAllRules()
  }),

  /**
   * Retrieve a specific rule by its ID.
   * @param id Identifier of the rule
   * @returns RouteRule or undefined
   */
  getRule: t.procedure
    .input(z.string())
    .query(async ({ input: id }): Promise<RouteRule | undefined> => {
      return handlers.getRule(id)
    }),

  /**
   * Add a new routing rule.
   * @param rule The new RouteRule to add
   */
  addRule: t.procedure
    .input(
      z.object({
        id: z.string(),
        enabled: z.boolean(),
        description: z.string(),
        drivers: z.array(z.any()),
      }),
    )
    .mutation(async ({ input: rule }) => {
      await handlers.addRule(rule)
    }),

  /**
   * Update an existing routing rule.
   * @param args Object containing id and updates
   */
  updateRule: t.procedure
    .input(z.object({ id: z.string(), updates: z.any() }))
    .mutation(async ({ input }) => {
      const { id, updates } = input
      await handlers.updateRule(id, updates)
    }),

  /**
   * Remove a routing rule by its ID.
   * @param id Identifier of the rule
   */
  removeRule: t.procedure.input(z.string()).mutation(async ({ input: id }) => {
    await handlers.removeRule(id)
  }),

  /**
   * Replace entire routing configuration with new rules.
   * @param newRules Array of RouteRule
   */
  updateConfig: t.procedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          enabled: z.boolean(),
          description: z.string(),
          drivers: z.array(z.any()),
        }),
      ),
    )
    .mutation(async ({ input: newRules }) => {
      await handlers.updateConfig(newRules)
    }),

  /**
   * Reload routing configuration from persistent storage.
   */
  reloadConfig: t.procedure.mutation(async (): Promise<void> => {
    await handlers.reloadConfig()
  }),

  /**
   * Trigger reload for a specific driver.
   * @param name Driver name
   */
  reloadDriver: t.procedure.input(z.string()).mutation(async ({ input }) => {
    handlers.reloadDriver(input)
  }),

  /**
   * Register a new driver instance under a unique name.
   * @param param0 Object with name and instance
   */
  addDriver: t.procedure
    .input(z.object({ name: z.string(), instance: z.any() }))
    .mutation(async ({ input }) => {
      handlers.addDriver(input.name, input.instance)
    }),

  /**
   * Enable a registered driver by name.
   * @param name Driver name
   */
  enableDriver: t.procedure.input(z.string()).mutation(async ({ input }) => {
    handlers.enableDriver(input)
  }),

  /**
   * Disable a registered driver by name.
   * @param name Driver name
   */
  disableDriver: t.procedure.input(z.string()).mutation(async ({ input }) => {
    handlers.disableDriver(input)
  }),

  /**
   * Remove (unregister) a driver by name.
   * @param name Driver name
   */
  removeDriver: t.procedure.input(z.string()).mutation(async ({ input }) => {
    handlers.removeDriver(input)
  }),
})
