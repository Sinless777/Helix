// apis/auth/src/user/user.entity.ts

import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
  BeforeCreate,
} from '@mikro-orm/core';
import { v5 as uuidv5 } from 'uuidv5';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // use your own constant UUID namespace

@Entity()
export class User {
  @PrimaryKey()
  id!: string;

  @Property()
  @Unique()
  email!: string;

  @Property({ nullable: true })
  passwordHash?: string;

  @Property({ nullable: true })
  name?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ nullable: true })
  gravatar?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
  
  @BeforeCreate()
  generateUuid() {
    if (!this.id && this.email) {
      this.id = uuidv5(this.email, NAMESPACE);
    }
  }
}
