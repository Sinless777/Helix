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
        notifications: { emailAlerts: false },
        privacy: { hideProfile: false },
        accessibility: { highContrast: false },
        product: { betaFeatures: false },
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

    const notif = { ...(settings.notifications || {}) };
    const privacy = { ...(settings.privacy || {}) };
    const accessibility = { ...(settings.accessibility || {}) };
    const product = { ...(settings.product || {}) };

    if (dto.notifications) Object.assign(notif, dto.notifications);
    if (dto.privacy) Object.assign(privacy, dto.privacy);
    if (dto.accessibility) Object.assign(accessibility, dto.accessibility);
    if (dto.product) Object.assign(product, dto.product);

    if (dto.emailAlerts !== undefined) notif.emailAlerts = dto.emailAlerts;
    if (dto.hideProfile !== undefined) privacy.hideProfile = dto.hideProfile;
    if (dto.highContrast !== undefined) accessibility.highContrast = dto.highContrast;
    if (dto.betaFeatures !== undefined) product.betaFeatures = dto.betaFeatures;

    settings.notifications = notif;
    settings.privacy = privacy;
    settings.accessibility = accessibility;
    settings.product = product;

    await this.em.flush();
    return settings;
  }
}
