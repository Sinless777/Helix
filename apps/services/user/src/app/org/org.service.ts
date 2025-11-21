// apps/services/user/src/app/org/org.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
  import { EntityManager } from '@mikro-orm/postgresql';
import {
  Org,
  OrgMember,
  OrgSettings,
  User,
} from '@helix-ai/db/entities';
import { CreateOrgDto, UpdateOrgDto } from './org.dto';

@Injectable()
export class OrgService {
  constructor(private readonly em: EntityManager) {}

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  private async getOrgOrThrow(id: string): Promise<Org> {
    const org = await this.em.findOne(Org, id);
    if (!org) {
      throw new NotFoundException('Org not found');
    }
    return org;
  }

  private async getUserOrThrow(id: string): Promise<User> {
    const user = await this.em.findOne(User, id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // -------------------------------------------------------------------
  // Create Org (with optional owner + settings)
  // -------------------------------------------------------------------

  async create(dto: CreateOrgDto): Promise<Org> {
    const org = this.em.create(Org, {
      name: dto.name,
      metadata: dto.metadata ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create blank settings record
    const settings = this.em.create(OrgSettings, {
      org,
      branding: {},
      security: {},
      defaults: {},
      billingPrefs: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    org.settings = settings;

    // Optional owner membership
    if (dto.ownerUserId) {
      const user = await this.getUserOrThrow(dto.ownerUserId);
      const member = this.em.create(OrgMember, {
        org,
        user,
        role: 'owner',
        attributes: { system: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      org.members.add(member);
    }

    await this.em.persistAndFlush(org);
    return org;
  }

  // -------------------------------------------------------------------
  // Read
  // -------------------------------------------------------------------

  async get(id: string): Promise<Org> {
    return this.getOrgOrThrow(id);
  }

  async listAll(): Promise<Org[]> {
    return this.em.find(Org, {}, { orderBy: { createdAt: 'ASC' } });
  }

  async listForUser(userId: string): Promise<Org[]> {
    const memberships = await this.em.find(
      OrgMember,
      { user: userId },
      {
        populate: ['org'],
        orderBy: { createdAt: 'ASC' },
      },
    );

    return memberships
      .map((m) => m.org)
      .filter((o): o is Org => !!o);
  }

  // -------------------------------------------------------------------
  // Update
  // -------------------------------------------------------------------

  async update(id: string, dto: UpdateOrgDto): Promise<Org> {
    const org = await this.getOrgOrThrow(id);

    if (dto.name !== undefined) {
      org.name = dto.name;
    }

    if (dto.metadata !== undefined) {
      org.metadata = {
        ...(org.metadata ?? {}),
        ...dto.metadata,
      };
    }

    await this.em.flush();
    return org;
  }

  // -------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------

  async delete(id: string): Promise<void> {
    const org = await this.getOrgOrThrow(id);
    await this.em.removeAndFlush(org);
  }
}
