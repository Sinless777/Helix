import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserSettings } from '@helix-ai/db/entities';
import { UpdateUserSettingsDto } from './user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Fetch settings for a user.
   * If no settings exist, create them (lazy initialization).
   */
  async getSettings(userId: string): Promise<UserSettings> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    let settings = await this.em.findOne(UserSettings, { user });

    // Lazy-create settings if missing
    if (!settings) {
      const now = new Date();
      settings = this.em.create(UserSettings, {
        user,
        notifications: {},
        privacy: {},
        accessibility: {},
        product: {},
        createdAt: now,
        updatedAt: now,
      });
      await this.em.persistAndFlush(settings);
    }

    return settings;
  }

  /**
   * Update settings; deep merge of JSON structures.
   */
  async updateSettings(
    userId: string,
    dto: UpdateUserSettingsDto,
  ): Promise<UserSettings> {
    const settings = await this.getSettings(userId);

    if (dto.notifications) {
      settings.notifications = {
        ...(settings.notifications || {}),
        ...dto.notifications,
      };
    }

    if (dto.privacy) {
      settings.privacy = {
        ...(settings.privacy || {}),
        ...dto.privacy,
      };
    }

    if (dto.accessibility) {
      settings.accessibility = {
        ...(settings.accessibility || {}),
        ...dto.accessibility,
      };
    }

    if (dto.product) {
      settings.product = {
        ...(settings.product || {}),
        ...dto.product,
      };
    }

    await this.em.flush();
    return settings;
  }
}
