// libs/logger/src/lib/config/RoutingConfig.ts

import { EventEmitter } from 'events'
import type { LogRecord } from '../../types/LogRecord'
import type { RouteRule } from '../../types/RouteRule'
import { ConfigService } from './ConfigService'
import { globMatch } from '../utils/globMatcher'

/**
 * @class RoutingConfig
 * @extends EventEmitter
 * @description
 * Manages runtime routing rules for log records. Uses {@link ConfigService}
 * to load and persist encrypted {@link RouteRule}s, and determines which
 * drivers should receive each log record.
 *
 * Features:
 * - Loads encrypted rules from DB via {@link ConfigService}
 * - Matches records by glob pattern and level (first-match wins)
 * - Falls back to default console+file drivers if no rule matches
 * - Exposes API to update or reload config and to trigger driver reloads
 */
export class RoutingConfig extends EventEmitter {
  /** In-memory list of active routing rules */
  private rules: RouteRule[] = []

  /** Default drivers if no rule matches; console is always included */
  private readonly defaultDrivers = ['console', 'file']

  /**
   * @param configService - Service instance responsible for encrypted persistence
   */
  constructor(private configService: ConfigService) {
    super()
    // Subscribe to config service events to keep in-memory rules in sync
    this.configService.on('configLoaded', (rules: RouteRule[]) =>
      this.setRules(rules),
    )
    this.configService.on('configReplaced', (rules: RouteRule[]) =>
      this.setRules(rules),
    )
    this.configService.on('ruleAdded', (rule: RouteRule) =>
      this.rules.push(rule),
    )
    this.configService.on('ruleUpdated', (updated: RouteRule) => {
      const idx = this.rules.findIndex((r) => r.id === updated.id)
      if (idx !== -1) this.rules[idx] = updated
    })
    this.configService.on('ruleRemoved', (id: string) => {
      this.rules = this.rules.filter((r) => r.id !== id)
    })
  }

  /**
   * Load routing rules from database into memory.
   * @returns Promise that resolves when rules are loaded.
   */
  public async init(): Promise<void> {
    await this.configService.loadConfig()
  }

  /**
   * Replace the in-memory rules and emit a 'rulesUpdated' event.
   * @param rules - New array of {@link RouteRule}
   */
  private setRules(rules: RouteRule[]): void {
    this.rules = rules
    this.emit('rulesUpdated', this.rules)
  }

  /**
   * Determine which drivers should handle a given log record.
   * Applies rules in order; returns the drivers of the first matching rule.
   * Falls back to default drivers if no enabled rule matches.
   *
   * @param record - The {@link LogRecord} to route
   * @returns Array of driver names to receive the record
   */
  public matchDrivers(record: LogRecord): string[] {
    const { level, metadata } = record
    const category = metadata?.['category'] ?? ''

    for (const rule of this.rules) {
      if (!rule.enabled) continue
      if (rule.levels && !rule.levels.includes(level)) continue
      if (rule.pattern && !globMatch(rule.pattern, category)) continue
      // First-match wins
      return rule.drivers
    }

    // No rule matched → default drivers
    return this.defaultDrivers
  }

  /**
   * Atomically replace all routing rules with a new set.
   * Persists changes via {@link ConfigService} and triggers 'rulesUpdated'.
   *
   * @param newRules - Array of new {@link RouteRule}
   * @returns Promise that resolves once replacement is complete
   */
  public async updateConfig(newRules: RouteRule[]): Promise<void> {
    await this.configService.replaceAll(newRules)
  }

  /**
   * Reload the routing rules from persistent storage.
   * Triggers a fresh load via {@link ConfigService}.
   *
   * @returns Promise that resolves once reload is done
   */
  public async reloadConfig(): Promise<void> {
    await this.configService.loadConfig()
  }

  /**
   * Emit an event requesting a driver reload.
   * External listeners should handle the actual reload logic.
   *
   * @param name - The driver name to reload
   */
  public reloadDriver(name: string): void {
    this.emit('driverReload', name)
  }
}
