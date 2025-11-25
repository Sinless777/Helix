// libs/db/src/entities/edge/device.entity.ts

import {
  Entity,
  Property,
  ManyToOne,
  Index,
  type Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../../entity.base';
import { Org } from '../org/org.entity';

/**
 * 🔹 Device
 *
 * Represents an IoT/edge device registered under an organization.
 * Stores protocol, a digital-twin state snapshot, and last-seen timestamp.
 *
 * Table: edge_device
 */
@Entity({ tableName: 'edge_device' })
@Index({ name: 'idx_device_org', properties: ['org'] })
@Index({ name: 'idx_device_protocol', properties: ['protocol'] })
@Index({ name: 'idx_device_last_seen', properties: ['lastSeenAt'] })
export class Device extends BaseEntity {
  /** Owning organization (tenant scope). */
  @ManyToOne(() => Org, { inversedBy: 'devices', fieldName: 'org_id', nullable: false })
  org!: Rel<Org>;

  /** Human-friendly name of the device. */
  @Property({ type: 'text' })
  name!: string;

  /** Communication protocol used by the device. */
  @Property({ type: 'text' })
  protocol!: 'mqtt' | 'http' | 'zigbee' | 'ble';

  /**
   * Digital twin state snapshot (schema varies by device type).
   * Example:
   * {
   *   firmware: "1.2.3",
   *   sensors: { tempC: 22.4, humidity: 0.41 },
   *   battery: { pct: 87 }
   * }
   */
  @Property({ type: 'jsonb', nullable: true })
  twinState?: Record<string, unknown>;

  /** Last time the device checked in / was seen online. */
  @Property({ type: 'datetime', nullable: true })
  lastSeenAt?: Date;

  /** Optional device metadata (labels, location, tags, etc.). */
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
