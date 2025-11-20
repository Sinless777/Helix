import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '@helix-ai/db/entities';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.em.findOne(User, {
      email: dto.email.toLowerCase(),
    });

    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = this.em.create(User, {
      email: dto.email.toLowerCase(),
      displayName: dto.displayName,
      metadata: dto.metadata ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.em.find(User, {}, {
      orderBy: { createdAt: 'DESC' },
      populate: ['profile', 'settings'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.em.findOne(
      User,
      { id },
      { populate: ['profile', 'settings'] },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.em.findOne(
      User,
      { email: email.toLowerCase() },
      { populate: ['profile', 'settings'] },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.displayName !== undefined) {
      user.displayName = dto.displayName;
    }

    if (dto.metadata) {
      user.metadata = {
        ...(user.metadata || {}),
        ...dto.metadata,
      };
    }

    await this.em.flush();
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.em.findOne(User, { id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.em.removeAndFlush(user);
  }
}
