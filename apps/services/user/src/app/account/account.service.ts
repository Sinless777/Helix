import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserAccount } from '@helix-ai/db/entities';
import { LinkAccountDto, UpdateAccountDto } from './account.dto';

@Injectable()
export class AccountService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Idempotent link:
   * - if (provider, accountId) exists, update and return
   * - else create
   */
  async linkAccount(dto: LinkAccountDto): Promise<UserAccount> {
    const user = await this.em.findOne(User, dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let account = await this.em.findOne(UserAccount, {
      provider: dto.provider,
      accountId: dto.accountId,
    });

    if (!account) {
      account = this.em.create(UserAccount, {
        user,
        provider: dto.provider,
        accountId: dto.accountId,
        displayName: dto.displayName,
        managementUrl: dto.managementUrl,
        status: dto.status ?? 'active',
        connectedAt: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.em.persistAndFlush(account);
      return account;
    }

    // Update existing mapping
    account.user = user;
    account.displayName = dto.displayName;
    account.managementUrl = dto.managementUrl ?? account.managementUrl;
    account.status = dto.status ?? account.status ?? 'active';

    await this.em.flush();
    return account;
  }

  async listForUser(userId: string): Promise<UserAccount[]> {
    return this.em.find(UserAccount, { user: userId }, {
      orderBy: { connectedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<UserAccount> {
    const account = await this.em.findOne(UserAccount, { id });
    if (!account) {
      throw new NotFoundException('User account not found');
    }
    return account;
  }

  async findByProviderAccount(
    provider: string,
    accountId: string,
  ): Promise<UserAccount> {
    const account = await this.em.findOne(UserAccount, {
      provider,
      accountId,
    });

    if (!account) {
      throw new NotFoundException('User account not found');
    }

    return account;
  }

  async update(
    id: string,
    dto: UpdateAccountDto,
  ): Promise<UserAccount> {
    const account = await this.findById(id);

    if (dto.displayName !== undefined) {
      account.displayName = dto.displayName;
    }

    if (dto.managementUrl !== undefined) {
      account.managementUrl = dto.managementUrl;
    }

    if (dto.status !== undefined) {
      account.status = dto.status;
    }

    await this.em.flush();
    return account;
  }

  async unlink(id: string): Promise<void> {
    const account = await this.em.findOne(UserAccount, { id });

    if (!account) {
      throw new NotFoundException('User account not found');
    }

    await this.em.removeAndFlush(account);
  }
}
