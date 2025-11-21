// apps/services/user/src/app/api-key/api-key.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ApiKey, User, Org } from '@helix-ai/db/entities';
import { CreateApiKeyDto, UpdateApiKeyDto } from './api-key.dto';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(private readonly em: EntityManager) {}

  // ----------------------------------------------------------------------
  // Utility: Generate secret and hash
  // ----------------------------------------------------------------------
  private generateSecret(): { secret: string; hash: string } {
    const secret = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(secret).digest('hex');
    return { secret, hash };
  }

  // ----------------------------------------------------------------------
  // Create API key
  // ----------------------------------------------------------------------
  async create(dto: CreateApiKeyDto): Promise<{
    apiKey: ApiKey;
    secret: string;
  }> {
    if (!dto.userId && !dto.orgId && !dto.allowUnscoped) {
      throw new BadRequestException(
        'Either userId or orgId must be provided',
      );
    }

    const { secret, hash } = this.generateSecret();

    let user: User | null = null;
    let org: Org | null = null;

    if (dto.userId) {
      user = await this.em.findOne(User, dto.userId);
      if (!user) throw new BadRequestException('User not found');
    }

    if (dto.orgId) {
      org = await this.em.findOne(Org, dto.orgId);
      if (!org) throw new BadRequestException('Org not found');
    }

    const apiKey = this.em.create(ApiKey, {
      name: dto.name,
      description: dto.description,
      scopes: dto.scopes.join(' '),
      hashedSecret: hash,
      user,
      org,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(apiKey);

    return { apiKey, secret };
  }

  // ----------------------------------------------------------------------
  // List API keys
  // ----------------------------------------------------------------------
  async listByUser(userId: string): Promise<ApiKey[]> {
    return this.em.find(ApiKey, { user: userId });
  }

  async listByOrg(orgId: string): Promise<ApiKey[]> {
    return this.em.find(ApiKey, { org: orgId });
  }

  // ----------------------------------------------------------------------
  // Get single key
  // ----------------------------------------------------------------------
  async get(id: string): Promise<ApiKey> {
    const key = await this.em.findOne(ApiKey, { id });
    if (!key) throw new NotFoundException('API key not found');
    return key;
  }

  // ----------------------------------------------------------------------
  // Update API key
  // ----------------------------------------------------------------------
  async update(id: string, dto: UpdateApiKeyDto): Promise<ApiKey> {
    const apiKey = await this.get(id);

    if (dto.name !== undefined) apiKey.name = dto.name;
    if (dto.description !== undefined)
      apiKey.description = dto.description;
    if (dto.scopes !== undefined)
      apiKey.scopes = dto.scopes.join(' ');
    if (dto.reason !== undefined) apiKey.reason = dto.reason;

    await this.em.flush();
    return apiKey;
  }

  // ----------------------------------------------------------------------
  // Revoke key
  // ----------------------------------------------------------------------
  async revoke(id: string, reason?: string): Promise<ApiKey> {
    const apiKey = await this.get(id);
    apiKey.revokedAt = new Date();
    apiKey.reason = reason ?? 'revoked';
    await this.em.flush();
    return apiKey;
  }

  // ----------------------------------------------------------------------
  // Update lastUsedAt
  // ----------------------------------------------------------------------
  async markUsed(id: string): Promise<void> {
    const apiKey = await this.get(id);
    apiKey.lastUsedAt = new Date();
    await this.em.flush();
  }
}
