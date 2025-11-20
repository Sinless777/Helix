// apps/services/user/src/app/org-member/org-member.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Org, OrgMember, User } from '@helix-ai/db/entities';
import { AddOrgMemberDto, UpdateOrgMemberDto } from './org-member.dto';

@Injectable()
export class OrgMemberService {
  constructor(private readonly em: EntityManager) {}

  private async getOrg(orgId: string): Promise<Org> {
    const org = await this.em.findOne(Org, orgId);
    if (!org) throw new NotFoundException('Org not found');
    return org;
  }

  private async getUser(userId: string): Promise<User> {
    const user = await this.em.findOne(User, userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async getMembership(orgId: string, userId: string) {
    return this.em.findOne(OrgMember, {
      org: orgId,
      user: userId,
    });
  }

  // ---------------------------------------------------------------------
  // Add a user to an organization
  // ---------------------------------------------------------------------
  async addMember(dto: AddOrgMemberDto): Promise<OrgMember> {
    const org = await this.getOrg(dto.orgId);
    const user = await this.getUser(dto.userId);

    const existing = await this.getMembership(dto.orgId, dto.userId);
    if (existing) {
      throw new BadRequestException(
        'User is already a member of this organization',
      );
    }

    const now = new Date();
    const member = this.em.create(OrgMember, {
      org,
      user,
      role: dto.role,
      attributes: dto.attributes ?? {},
      createdAt: now,
      updatedAt: now,
    });

    await this.em.persistAndFlush(member);
    return member;
  }

  // ---------------------------------------------------------------------
  // List org members
  // ---------------------------------------------------------------------
  async listMembers(orgId: string): Promise<OrgMember[]> {
    await this.getOrg(orgId);
    return this.em.find(OrgMember, { org: orgId }, {
      populate: ['user'],
      orderBy: { createdAt: 'ASC' },
    });
  }

  // ---------------------------------------------------------------------
  // List orgs a user belongs to
  // ---------------------------------------------------------------------
  async listOrgsForUser(userId: string): Promise<OrgMember[]> {
    await this.getUser(userId);
    return this.em.find(OrgMember, { user: userId }, {
      populate: ['org'],
      orderBy: { createdAt: 'ASC' },
    });
  }

  // ---------------------------------------------------------------------
  // Update membership (role, attributes)
  // ---------------------------------------------------------------------
  async updateMember(
    orgId: string,
    userId: string,
    dto: UpdateOrgMemberDto,
  ): Promise<OrgMember> {
    const member = await this.getMembership(orgId, userId);
    if (!member) {
      throw new NotFoundException('Membership not found');
    }

    if (dto.role !== undefined) {
      member.role = dto.role;
    }

    if (dto.attributes !== undefined) {
      member.attributes = {
        ...(member.attributes ?? {}),
        ...dto.attributes,
      };
    }

    await this.em.flush();
    return member;
  }

  // ---------------------------------------------------------------------
  // Remove a user from an org
  // ---------------------------------------------------------------------
  async removeMember(orgId: string, userId: string): Promise<void> {
    const member = await this.getMembership(orgId, userId);
    if (!member) {
      throw new NotFoundException('Membership not found');
    }

    await this.em.removeAndFlush(member);
  }
}
