import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserSession } from '@helix-ai/db/entities';
import { CreateSessionDto, ValidateSessionDto, RevokeSessionDto } from './session.dto';

@Injectable()
export class SessionService {
  constructor(private readonly em: EntityManager) {}

  /** Create a new session */
  async createSession(dto: CreateSessionDto): Promise<UserSession> {
    const user = await this.em.findOne(User, dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    const session = this.em.create(UserSession, {
      user,
      sessionToken: dto.sessionToken,
      expires: new Date(dto.expires),
      createdAt: now,
      updatedAt: now,
    });

    await this.em.persistAndFlush(session);

    return (session as unknown) as UserSession;
  }

  /** Validate and return the user for a given session token */
  async validateSession(dto: ValidateSessionDto): Promise<User> {
    const session = await this.em.findOne(UserSession, {
      sessionToken: dto.sessionToken,
    }, { populate: ['user'] });

    if (!session) {
      throw new UnauthorizedException('Invalid session token');
    }

    if (session.expires.getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    return (session.user as unknown) as User;
  }

  /** Revoke a specific session */
  async revokeSession(dto: RevokeSessionDto) {
    const session = await this.em.findOne(UserSession, {
      sessionToken: dto.sessionToken,
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.em.removeAndFlush(session);

    return { success: true };
  }

  /** Fetch all sessions for a particular user */
  async listSessions(userId: string): Promise<UserSession[]> {
    const sessions = await this.em.find(UserSession, { user: userId });
    return (sessions as unknown) as UserSession[];
  }

  /** Delete all sessions belonging to a user (e.g., logout-all) */
  async revokeAllForUser(userId: string) {
    const sessions = await this.em.find(UserSession, { user: userId });
    await this.em.removeAndFlush(sessions);

    return { success: true };
  }
}
