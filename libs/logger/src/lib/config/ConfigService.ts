import { EventEmitter } from 'events'
import type { RouteRule } from '../../types/RouteRule'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = process.env['LOGGER_ENCRYPTION_KEY'] || ''

/**
 * Service to load, update, and manage routing configuration rules.
 * Persists encrypted rules via MikroORM, emits events on changes.
 */
export class ConfigService extends EventEmitter {
  private orm: MikroORM
  private em: EntityManager
  private rules: RouteRule[] = []

  /**
   * @param orm Initialized MikroORM instance pointing to LoggerConfig entity/table
   */
  constructor(orm: MikroORM) {
    super()
    this.orm = orm
    this.em = orm.em
  }

  /**
   * Load all rules from the database (decrypting) into memory.
   */
  public async loadConfig(): Promise<void> {
    // Assuming a LoggerConfig entity with id and encryptedPayload fields
    const entries = await this.em.find('LoggerConfig', {})
    this.rules = entries.map((e: any) => this.decrypt(e.encryptedPayload))
    this.emit('configLoaded', this.rules)
  }

  /**
   * Get all in-memory routing rules.
   */
  public getRules(): RouteRule[] {
    return [...this.rules]
  }

  /**
   * Add a new rule, persist encrypted, and emit update.
   * @param rule New routing rule
   */
  public async addRule(rule: RouteRule): Promise<void> {
    const payload = this.encrypt(rule)
    const configEntry = this.em.create('LoggerConfig', {
      encryptedPayload: payload,
    })
    await this.em.persistAndFlush(configEntry)
    this.rules.push(rule)
    this.emit('ruleAdded', rule)
  }

  /**
   * Update existing rule by id, persist changes, and emit update.
   * @param id Rule identifier
   * @param updates Partial updates to apply
   */
  public async updateRule(
    id: string,
    updates: Partial<RouteRule>,
  ): Promise<void> {
    const idx = this.rules.findIndex((r) => r.id === id)
    if (idx === -1) {
      throw new Error(`Rule not found: ${id}`)
    }
    const updated = { ...this.rules[idx], ...updates }
    this.rules[idx] = updated
    const payload = this.encrypt(updated)
    await this.em.nativeUpdate(
      'LoggerConfig',
      { id },
      { encryptedPayload: payload },
    )
    this.emit('ruleUpdated', updated)
  }

  /**
   * Remove a rule by id, delete from DB, and emit removal.
   * @param id Rule identifier
   */
  public async removeRule(id: string): Promise<void> {
    await this.em.nativeDelete('LoggerConfig', { id })
    this.rules = this.rules.filter((r) => r.id !== id)
    this.emit('ruleRemoved', id)
  }

  /**
   * Replace all rules atomically with a new set.
   * @param newRules Array of new routing rules
   */
  public async replaceAll(newRules: RouteRule[]): Promise<void> {
    // Delete existing, then insert all
    await this.em.nativeDelete('LoggerConfig', {})
    for (const rule of newRules) {
      const payload = this.encrypt(rule)
      const configEntry = this.em.create('LoggerConfig', {
        encryptedPayload: payload,
      })
      await this.em.persistAndFlush(configEntry)
    }
    this.rules = [...newRules]
    this.emit('configReplaced', this.rules)
  }

  /**
   * Encrypt a RouteRule to a string.
   */
  private encrypt(rule: RouteRule): string {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv)
    const data = Buffer.concat([
      cipher.update(JSON.stringify(rule), 'utf8'),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, tag, data]).toString('base64')
  }

  /**
   * Decrypt an encrypted payload back to a RouteRule.
   */
  private decrypt(payload: string): RouteRule {
    const buf = Buffer.from(payload, 'base64')
    const iv = buf.slice(0, 12)
    const tag = buf.slice(12, 28)
    const data = buf.slice(28)
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(KEY, 'hex'),
      iv,
    )
    decipher.setAuthTag(tag)
    const json = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]).toString('utf8')
    return JSON.parse(json) as RouteRule
  }
}
