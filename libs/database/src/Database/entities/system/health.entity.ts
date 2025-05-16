import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../base.entity'

/**
 * Represents system health metrics at a given point in time.
 *
 * Inherits common fields (id, timestamps, soft-delete) from BaseEntity.
 */
@Entity({ tableName: 'system_health' })
export class Health extends BaseEntity {
  /**
   * Current overall status of the system (e.g., 'OK', 'DEGRADED').
   */
  @Property({ type: 'text', name: 'system_status' })
  systemStatus!: string

  /**
   * Application version or build identifier.
   */
  @Property({ type: 'text', name: 'system_version' })
  systemVersion!: string

  /**
   * Uptime of the system in human-readable format (e.g., '24h 15m').
   */
  @Property({ type: 'text', name: 'system_uptime' })
  systemUptime!: string

  /**
   * Current CPU utilization percentage (e.g., '55%').
   */
  @Property({ type: 'text', name: 'system_cpu' })
  systemCPU!: string

  /**
   * Current memory usage (e.g., '1.2GB').
   */
  @Property({ type: 'text', name: 'system_memory' })
  systemMemory!: string

  /**
   * Average request latency in milliseconds (e.g., '120ms').
   */
  @Property({ type: 'text' })
  latency!: string

  /**
   * Timestamp for when these health metrics were recorded.
   */
  @Property({ type: 'timestamptz' })
  recordedAt: Date = new Date()
}
