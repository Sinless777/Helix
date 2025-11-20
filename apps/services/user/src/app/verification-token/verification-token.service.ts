import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserVerificationToken } from '@helix-ai/db/entities';
import { CreateVerificationTokenDto, VerifyTokenDto } from './verification-token.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class VerificationTokenService {
  private readonly defaultExpirySeconds = 15 * 60; // 15 minutes

  constructor(private readonly em: EntityManager) {}

  /**
   * Generate a random token string.
   * You can swap this for a more complex scheme or hashing later.
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create a new verification token for a user + identifier.
   * Returns the raw token so it can be emailed or sent via other channels.
   */
  async createToken(dto: CreateVerificationTokenDto): Promise<{
    token: string;
    expires: Date;
    userId: string;
    identifier: string;
  }> {
    const user = await this.em.findOne(User, { id: dto.userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    const expiresIn = dto.expiresInSeconds ?? this.defaultExpirySeconds;
    const expires = new Date(now.getTime() + expiresIn * 1000);
    const token = this.generateToken();

    const entity = this.em.create(UserVerificationToken, {
      user,
      identifier: dto.identifier.toLowerCase(),
      token,
      expires,
      createdAt: now,
      updatedAt: now,
    });

    await this.em.persistAndFlush(entity);

    return {
      token,
      expires,
      userId: user.id,
      identifier: entity.identifier,
    };
  }

  /**
   * Validate and consume a verification token.
   * If valid, deletes the token (one-time use) and returns the user id.
   */
  async verifyAndConsume(dto: VerifyTokenDto): Promise<{
    userId: string;
    identifier: string;
    verifiedAt: Date;
  }> {
    const now = new Date();

    const tokenEntity = await this.em.findOne(UserVerificationToken, {
      token: dto.token,
      identifier: dto.identifier.toLowerCase(),
      user: dto.userId,
    });

    if (!tokenEntity) {
      throw new NotFoundException('Verification token not found or already used');
    }

    if (tokenEntity.expires <= now) {
      // Token expired - remove it to avoid clutter
      await this.em.removeAndFlush(tokenEntity);
      throw new BadRequestException('Verification token has expired');
    }

    const result = {
      userId: tokenEntity.user.id,
      identifier: tokenEntity.identifier,
      verifiedAt: now,
    };

    // One-time use: delete token after successful verification
    await this.em.removeAndFlush(tokenEntity);

    return result;
  }

  /**
   * Optional helper to prune expired tokens.
   * You can call this from a cron/worker later if desired.
   */
  async pruneExpired(before: Date = new Date()): Promise<number> {
    const qb = this.em.createQueryBuilder(UserVerificationToken);
    const res = await qb
      .delete()
      .where({ expires: { $lte: before } })
      .execute('run');

    // MikroORM returns different shapes depending on driver; normalize to number
    const affected = (res as any)?.affectedRows ?? (res as any)?.rowCount ?? 0;
    return affected;
  }
}
