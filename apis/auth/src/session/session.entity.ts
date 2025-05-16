import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  Index,
} from '@mikro-orm/core';
import { User } from '../user/user.entity';
import { v5 as uuidv5 } from 'uuidv5';

const SESSION_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Example UUID namespace (can be changed or generated)

@Entity()
export class Session {
  @PrimaryKey()
  id: string = uuidv5(`${Date.now()}-${Math.random()}`, SESSION_NAMESPACE);

  @ManyToOne(() => User)
  user: User;

  @Property()
  ipAddress: string;

  @Property({ nullable: true })
  geoLocation?: string;

  @Property({ nullable: true })
  geoIP?: string;

  @Property()
  userAgent: string;

  @Index()
  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  expiresAt?: Date;

  @Property({ default: false })
  revoked: boolean = false;
}
