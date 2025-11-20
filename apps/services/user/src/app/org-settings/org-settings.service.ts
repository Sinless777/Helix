// apps/services/user/src/app/org-settings/org-settings.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Org, OrgSettings } from '@helix-ai/db/entities';
import { UpdateOrgSettingsDto } from './org-settings.dto';

@Injectable()
export class OrgSettingsService {
  constructor(private readonly em: EntityManager) {}

  private async getOrg(orgId: string): Promise<Org> {
    const org = await this.em.findOne(Org, orgId);
    if (!org) {
      throw new NotFoundException('Org not found');
    }
    return org;
  }

  /**
   * Get OrgSettings for an org, or null if not created yet.
   */
  async get(orgId: string): Promise<OrgSettings | null> {
    const org = await this.getOrg(orgId);
    return this.em.findOne(OrgSettings, { org });
  }

  /**
   * Ensure an OrgSettings row exists for the org, creating a blank
   * one if it does not yet exist.
   */
  async ensure(orgId: string): Promise<OrgSettings> {
    const org = await this.getOrg(orgId);

    let settings = await this.em.findOne(OrgSettings, { org });
    if (!settings) {
      settings = this.em.create(OrgSettings, {
        org,
        branding: {},
        security: {},
        defaults: {},
        billingPrefs: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.em.persistAndFlush(settings);
    }

    return settings;
  }

  /**
   * Shallow-merge update for OrgSettings JSON fields.
   * If a field is provided, it overwrites / merges existing object.
   */
  async update(
    orgId: string,
    dto: UpdateOrgSettingsDto,
  ): Promise<OrgSettings> {
    const settings = await this.ensure(orgId);

    if (dto.branding !== undefined) {
      settings.branding = {
        ...(settings.branding ?? {}),
        ...dto.branding,
      };
    }

    if (dto.security !== undefined) {
      settings.security = {
        ...(settings.security ?? {}),
        ...dto.security,
      };
    }

    if (dto.defaults !== undefined) {
      settings.defaults = {
        ...(settings.defaults ?? {}),
        ...dto.defaults,
      };
    }

    if (dto.billingPrefs !== undefined) {
      settings.billingPrefs = {
        ...(settings.billingPrefs ?? {}),
        ...dto.billingPrefs,
      };
    }

    await this.em.flush();
    return settings;
  }
}
