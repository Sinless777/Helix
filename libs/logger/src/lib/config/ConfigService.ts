// libs/logger/src/lib/config/ConfigService.ts

import { EventEmitter } from 'events'
import type { RouteRule } from '../../types/RouteRule'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = process.env['LOGGER_ENCRYPTION_KEY'] || ''

/**
 * @class ConfigService
 * @extends EventEmitter
 * @description
 * Manages the lifecycle of routing rules: loading from the database,
 * adding/updating/removing rules, and emitting events on changes.
 * Rules are stored encrypted in the database using AES-256-GCM.
 */
export class ConfigService extends EventEmitter {
  /** @private Underlying MikroORM instance */
  private readonly orm: MikroORM

  /** @private Entity manager for DB operations */
  private readonly em: EntityManager

  /** @private In-memory cache of decrypted routing rules */
  private rules: RouteRule[] = []

  /**
   * @constructor
   * @param {MikroORM} orm - Initialized MikroORM instance configured for LoggerConfig entity
   */
  constructor(orm: MikroORM) {
    super()
    this.orm = orm
    this.em = orm.em
  }

  /**
   * @method loadConfig
   * @async
   * @description
   * Fetches all encrypted rule entries from the `LoggerConfig` table,
   * decrypts each payload into a {@link RouteRule}, stores them in-memory,
   * and emits a `configLoaded` event with the full list.
   *
   * @emits ConfigService#configLoaded
   * @returns {Promise<void>}
   */
  public async loadConfig(): Promise<void> {
    const entries = await this.em.find('LoggerConfig', {})
    this.rules = entries.map((e: any) => this.decrypt(e.encryptedPayload))
    this.emit('configLoaded', this.rules)
  }

  /**
   * @method getRules
   * @description
   * Returns a shallow copy of the current in-memory routing rules.
   *
   * @returns {RouteRule[]}
   */
  public getRules(): RouteRule[] {
    return [...this.rules]
  }

  /**
   * @method addRule
   * @async
   * @param {RouteRule} rule - New routing rule to persist
   * @description
   * Encrypts and stores a new rule in the database, updates the in-memory list,
   * and emits a `ruleAdded` event with the added rule.
   *
   * @emits ConfigService#ruleAdded
   * @returns {Promise<void>}
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
   * @method updateRule
   * @async
   * @param {string} id - Identifier of the rule to update
   * @param {Partial<RouteRule>} updates - Fields to merge into the existing rule
   * @description
   * Finds the rule by `id`, merges updates, re-encrypts and persists the change,
   * updates in-memory cache, and emits a `ruleUpdated` event.
   *
   * @throws {Error} If rule with given `id` does not exist
   * @emits ConfigService#ruleUpdated
   * @returns {Promise<void>}
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
   * @method removeRule
   * @async
   * @param {string} id - Identifier of the rule to remove
   * @description
   * Deletes the rule entry from the database, removes it from in-memory cache,
   * and emits a `ruleRemoved` event with the removed rule ID.
   *
   * @emits ConfigService#ruleRemoved
   * @returns {Promise<void>}
   */
  public async removeRule(id: string): Promise<void> {
    await this.em.nativeDelete('LoggerConfig', { id })
    this.rules = this.rules.filter((r) => r.id !== id)
    this.emit('ruleRemoved', id)
  }

  /**
   * @method replaceAll
   * @async
   * @param {RouteRule[]} newRules - Array of new routing rules to persist
   * @description
   * Atomically replaces all existing rules: clears the DB table, persists each rule encrypted,
   * refreshes in-memory cache, and emits a `configReplaced` event with the full new list.
   *
   * @emits ConfigService#configReplaced
   * @returns {Promise<void>}
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
   * @method encrypt
   * @private
   * @param {RouteRule} rule - Rule object to encrypt
   * @description
   * Serializes the rule to JSON, encrypts with AES-256-GCM using `LOGGER_ENCRYPTION_KEY`,
   * and returns a Base64-encoded string containing IV, auth tag, and ciphertext.
   *
   * @returns {string} Base64-encoded encrypted payload
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
   * @method decrypt
   * @private
   * @param {string} payload - Base64-encoded encrypted payload
   * @description
   * Decodes Base64, extracts IV, auth tag, and ciphertext, decrypts using AES-256-GCM,
   * and parses the plaintext JSON back into a {@link RouteRule}.
   *
   * @returns {RouteRule} Decrypted routing rule
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
    const plaintext = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]).toString('utf8')
    return JSON.parse(plaintext) as RouteRule
  }
}
