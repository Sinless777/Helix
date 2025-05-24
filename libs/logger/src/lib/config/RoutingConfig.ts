import { EventEmitter } from 'events'
import type { LogRecord } from '../../types/LogRecord'
import type { RouteRule } from '../../types/RouteRule'
import { ConfigService } from './ConfigService'
import { globMatch } from '../utils/globMatcher'

/**
 * Manages routing rules for log records:
 * - Loads encrypted RouteRule list via ConfigService
 * - Matches records to drivers (first-match wins)
 * - Provides default fallback rule
 * - Exposes API to update/reload config and reload drivers
 */
export class RoutingConfig extends EventEmitter {
  private rules: RouteRule[] = []
  private readonly defaultDrivers = ['console', 'file']

  constructor(private configService: ConfigService) {
    super()
    // Listen for config changes
    this.configService.on('configLoaded', (rules) => this.setRules(rules))
    this.configService.on('configReplaced', (rules) => this.setRules(rules))
    this.configService.on('ruleAdded', (rule) => this.rules.push(rule))
    this.configService.on('ruleUpdated', (updated) => {
      const idx = this.rules.findIndex((r) => r.id === updated.id)
      if (idx !== -1) this.rules[idx] = updated
    })
    this.configService.on('ruleRemoved', (id) => {
      this.rules = this.rules.filter((r) => r.id !== id)
    })
  }

  /**
   * Initialize by loading rules from DB.
   */
  public async init(): Promise<void> {
    await this.configService.loadConfig()
  }

  /**
   * Update in-memory rules and emit event.
   */
  private setRules(rules: RouteRule[]): void {
    this.rules = rules
    this.emit('rulesUpdated', this.rules)
  }

  /**
   * Determine target drivers for a log record.
   * First matching rule wins; fallback to defaultDrivers.
   */
  public matchDrivers(record: LogRecord): string[] {
    const lvl = record.level
    const category = record.metadata?.['category'] || ''
    for (const rule of this.rules) {
      if (!rule.enabled) continue
      // Level match
      if (rule.levels && !rule.levels.includes(lvl)) continue
      // Category match via glob
      if (rule.pattern && !globMatch(rule.pattern, category)) continue
      return rule.drivers
    }
    // always include console
    return this.defaultDrivers
  }

  /**
   * Replace all routing rules atomically.
   */
  public async updateConfig(newRules: RouteRule[]): Promise<void> {
    await this.configService.replaceAll(newRules)
  }

  /**
   * Reload rules from DB.
   */
  public async reloadConfig(): Promise<void> {
    await this.configService.loadConfig()
  }

  /**
   * Trigger driver reload (hook for external integration).
   */
  public reloadDriver(name: string): void {
    this.emit('driverReload', name)
  }
}
