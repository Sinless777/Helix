// libs/logger/src/api/trpc/routers.ts

import { initTRPC } from '@trpc/server'
import type { Context } from './context'
import * as handlers from './handlers'
import type { RouteRule } from '../../types/RouteRule'
import { z } from 'zod'

const t = initTRPC.context<Context>().create()

/**
 * tRPC router for logger configuration and driver management.
 */
export const loggerRouter = t.router({
  /**
   * Retrieve all routing rules.
   *
   * @returns An array of all RouteRule objects.
   */
  getAllRules: t.procedure.query(async (): Promise<RouteRule[]> => {
    return handlers.getAllRules()
  }),

  /**
   * Retrieve a routing rule by its ID.
   *
   * @param input - The ID of the rule to retrieve.
   * @returns The matching RouteRule, or undefined if not found.
   */
  getRule: t.procedure
    .input(z.string())
    .query(async ({ input }): Promise<RouteRule | undefined> => {
      return handlers.getRule(input)
    }),

  /**
   * Create a new routing rule.
   *
   * @param input - The RouteRule to add.
   */
  addRule: t.procedure
    .input(
      z.object({
        id: z.string().uuid(),
        enabled: z.boolean(),
        description: z.string(),
        pattern: z.string().optional(),
        levels: z
          .array(
            z.enum([
              'info',
              'warn',
              'error',
              'debug',
              'trace',
              'fatal',
              'success',
            ]),
          )
          .optional(),
        drivers: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      await handlers.addRule(input)
    }),

  /**
   * Update fields on an existing routing rule.
   *
   * @param input - Object containing the rule ID and updates.
   */
  updateRule: t.procedure
    .input(
      z.object({
        id: z.string().uuid(),
        updates: z
          .object({
            enabled: z.boolean().optional(),
            description: z.string().optional(),
            pattern: z.string().optional(),
            levels: z
              .array(
                z.enum([
                  'info',
                  'warn',
                  'error',
                  'debug',
                  'trace',
                  'fatal',
                  'success',
                ]),
              )
              .optional(),
            drivers: z.array(z.string()).optional(),
          })
          .partial(),
      }),
    )
    .mutation(async ({ input: { id, updates } }) => {
      await handlers.updateRule(id, updates)
    }),

  /**
   * Delete a routing rule by ID.
   *
   * @param input - The ID of the rule to remove.
   */
  removeRule: t.procedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      await handlers.removeRule(input)
    }),

  /**
   * Overwrite the entire routing configuration.
   *
   * @param input - Array of new RouteRule objects.
   */
  updateConfig: t.procedure
    .input(
      z.array(
        z.object({
          id: z.string().uuid(),
          enabled: z.boolean(),
          description: z.string(),
          pattern: z.string().optional(),
          levels: z
            .array(
              z.enum([
                'info',
                'warn',
                'error',
                'debug',
                'trace',
                'fatal',
                'success',
              ]),
            )
            .optional(),
          drivers: z.array(z.string()),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      await handlers.updateConfig(input)
    }),

  /**
   * Reload routing rules from the database.
   */
  reloadConfig: t.procedure.mutation(async () => {
    await handlers.reloadConfig()
  }),

  /**
   * Trigger a hot-reload of a driver by name.
   *
   * @param input - The driver name.
   */
  reloadDriver: t.procedure.input(z.string()).mutation(async ({ input }) => {
    handlers.reloadDriver(input)
  }),

  /**
   * Register a new driver instance.
   *
   * @param input - Object containing:
   *   - name: Unique driver name.
   *   - instance: DriverBase instance.
   */
  addDriver: t.procedure
    .input(z.object({ name: z.string(), instance: z.any() }))
    .mutation(async ({ input: { name, instance } }) => {
      handlers.addDriver(name, instance)
    }),

  /**
   * Enable a registered driver.
   *
   * @param input - The driver name.
   */
  enableDriver: t.procedure.input(z.string()).mutation(({ input }) => {
    handlers.enableDriver(input)
  }),

  /**
   * Disable a registered driver.
   *
   * @param input - The driver name.
   */
  disableDriver: t.procedure.input(z.string()).mutation(({ input }) => {
    handlers.disableDriver(input)
  }),

  /**
   * Unregister (and shut down) a driver.
   *
   * @param input - The driver name.
   */
  removeDriver: t.procedure.input(z.string()).mutation(({ input }) => {
    handlers.removeDriver(input)
  }),
})
