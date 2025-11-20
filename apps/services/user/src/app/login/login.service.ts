// apps/services/user/src/app/login/login.service.ts
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '@helix-ai/db/entities';
import { LoginDto, LoginResponseDto } from './login.dto';
import { SessionService } from '../session/session.service';
import { randomBytes } from 'crypto';

@Injectable()
export class LoginService {
  constructor(
    private readonly em: EntityManager,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Validate credentials and issue a new session.
   * Password hash is stored under user.metadata.auth.passwordHash.
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const email = dto.email.toLowerCase();

    const user = await this.em.findOne(User, { email });
    if (!user) {
      // Do not reveal whether email or password is wrong
      throw new UnauthorizedException('Invalid credentials');
    }

    const metadata = (user.metadata ?? {}) as Record<string, unknown>;
    const authMeta = (metadata.auth ?? {}) as Record<string, unknown>;
    const storedHash = authMeta.passwordHash as string | undefined;

    if (!storedHash || storedHash !== dto.hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ttl = dto.sessionTtlMs ?? 7 * 24 * 60 * 60 * 1000; // 7 days
    const expires = new Date(Date.now() + ttl);

    const sessionToken = randomBytes(32).toString('hex');

    await this.sessionService.createSession({
      userId: user.id,
      sessionToken,
      expires: expires.toISOString(),
    });

    return {
      userId: user.id,
      sessionToken,
      expires: expires.toISOString(),
    };
  }
}
