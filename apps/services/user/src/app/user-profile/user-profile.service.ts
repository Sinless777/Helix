import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserProfile } from '@helix-ai/db/entities';
import { UpdateUserProfileDto } from './user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Lazy-create a profile if missing.
   */
  private async ensureProfile(user: User): Promise<UserProfile> {
    let profile = await this.em.findOne(UserProfile, { user });

    if (!profile) {
      const now = new Date();
      profile = this.em.create(UserProfile, {
        user,
        handle: user.email.split('@')[0], // safe fallback, can be overridden later
        avatarUrl: null,
        bio: null,
        links: {},
        createdAt: now,
        updatedAt: now,
      });
      await this.em.persistAndFlush(profile);
    }

    return profile;
  }

  /**
   * Fetch a profile by userId.
   */
  async getByUserId(userId: string): Promise<UserProfile> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    return this.ensureProfile(user);
  }

  /**
   * Fetch a profile by handle.
   * Throws if not found.
   */
  async getByHandle(handle: string): Promise<UserProfile> {
    const profile = await this.em.findOne(UserProfile, {
      handle: handle.toLowerCase(),
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  /**
   * Update a profile.
   * Performs merge for json fields.
   */
  async update(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    const profile = await this.ensureProfile(user);

    // Handle unicity checks
    if (dto.handle && dto.handle !== profile.handle) {
      const exists = await this.em.findOne(UserProfile, {
        handle: dto.handle.toLowerCase(),
      });

      if (exists) {
        throw new BadRequestException('Handle is already in use');
      }

      profile.handle = dto.handle.toLowerCase();
    }

    if (dto.avatarUrl !== undefined) {
      profile.avatarUrl = dto.avatarUrl ?? undefined;
    }

    if (dto.bio !== undefined) {
      profile.bio = dto.bio ?? undefined;
    }

    if (dto.links) {
      profile.links = {
        ...(profile.links || {}),
        ...dto.links,
      };
    }

    await this.em.flush();
    return profile;
  }
}
