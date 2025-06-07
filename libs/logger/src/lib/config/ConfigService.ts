// libs/logger/src/lib/config/ConfigService.ts

import { EventEmitter } from 'events'
import type { RouteRule } from '../../types/RouteRule'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = process.env['LOGGER_ENCRYPTION_KEY'] || ''

/**
 * Manages the lifecycle of routing rules: loading from the database,
 * adding/updating/removing rules, and emitting events on changes.
 * Rules are stored encrypted in the database using AES-256-GCM.
 */
export class ConfigService extends EventEmitter {
  private readonly orm: MikroORM
  private readonly em: EntityManager
  private rules: RouteRule[] = []

  /**
   * Construct the service with a configured MikroORM instance.
   *
   * @param orm - Initialized MikroORM instance for the LoggerConfig table
   */
  constructor(orm: MikroORM) {
    super()
    this.orm = orm
    this.em = orm.em
  }

  /**
   * Load all encrypted rules from the `LoggerConfig` table,
   * decrypt them into `RouteRule` objects, cache in memory,
   * and emit a `configLoaded` event with the full list.
   *
   * @returns Promise that resolves once loading and decryption are complete
   */
  public async loadConfig(): Promise<void> {
    const entries = await this.em.find('LoggerConfig', {})
    this.rules = entries.map((e: any) => this.decrypt(e.encryptedPayload))
    this.emit('configLoaded', this.rules)
  }

  /**
   * Get a shallow copy of the current in-memory routing rules.
   *
   * @returns Array of decrypted `RouteRule` objects
   */
  public getRules(): RouteRule[] {
    return [...this.rules]
  }

  /**
   * Encrypt and persist a new routing rule.
   * Updates the in-memory cache and emits `ruleAdded`.
   *
   * @param rule - The new routing rule to add
   * @returns Promise that resolves once the rule is saved
   */
  public async addRule(rule: RouteRule): Promise<void> {
    const payload = this.encrypt(rule)
    const entry = this.em.create('LoggerConfig', { encryptedPayload: payload })
    await this.em.persistAndFlush(entry)
    this.rules.push(rule)
    this.emit('ruleAdded', rule)
  }

  /**
   * Apply partial updates to an existing rule by ID.
   * Re-encrypts and persists the updated rule, updates cache,
   * and emits `ruleUpdated`.
   *
   * @param id - Identifier of the rule to update
   * @param updates - Fields to merge into the existing rule
   * @throws Error if no rule with the given ID exists
   * @returns Promise that resolves once the update is saved
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
   * Delete a rule by ID from both the database and in-memory cache,
   * then emits `ruleRemoved`.
   *
   * @param id - Identifier of the rule to remove
   * @returns Promise that resolves once deletion is complete
   */
  public async removeRule(id: string): Promise<void> {
    await this.em.nativeDelete('LoggerConfig', { id })
    this.rules = this.rules.filter((r) => r.id !== id)
    this.emit('ruleRemoved', id)
  }

  /**
   * Atomically replace all rules: clears the table, saves each new rule,
   * updates cache, and emits `configReplaced`.
   *
   * @param newRules - Array of new routing rules to persist
   * @returns Promise that resolves once replacement is done
   */
  public async replaceAll(newRules: RouteRule[]): Promise<void> {
    await this.em.nativeDelete('LoggerConfig', {})
    for (const rule of newRules) {
      const payload = this.encrypt(rule)
      const entry = this.em.create('LoggerConfig', {
        encryptedPayload: payload,
      })
      await this.em.persistAndFlush(entry)
    }
    this.rules = [...newRules]
    this.emit('configReplaced', this.rules)
  }

  /**
   * Encrypt a RouteRule into a Base64 string using AES-256-GCM.
   *
   * @param rule - The routing rule to encrypt
   * @returns Base64-encoded payload containing IV, tag, and ciphertext
   */
  private encrypt(rule: RouteRule): string {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv)
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(rule), 'utf8'),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, tag, ciphertext]).toString('base64')
  }

  /**
   * Decrypt a Base64-encoded payload back into a RouteRule.
   *
   * @param payload - Base64 string with IV, tag, and ciphertext
   * @returns The decrypted `RouteRule` object
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
