// apps/services/user/src/app/signup/signup.service.ts

import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, WaitlistEntry } from '@helix-ai/db/entities';
import { SignupDto } from './signup.dto';
import { VerificationTokenService } from '../verification-token/verification-token.service';

@Injectable()
export class SignupService {
  constructor(
    private readonly em: EntityManager,
    private readonly verificationTokenService: VerificationTokenService,
  ) {}

  /**
   * Check if an email is available for signup (i.e. user does not already exist).
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.em.findOne(User, {
      email: email.toLowerCase(),
    });
    return !user;
  }

  /**
   * Main signup flow:
   * - Enforce "no duplicate user" semantics by email
   * - Create User with hashedPassword stored in metadata
   * - Promote or create WaitlistEntry and mark as joined
   * - Optionally create a verification token
   */
  async signup(dto: SignupDto): Promise<{
    user: User;
    verificationToken?: string;
    verificationExpiresAt?: Date;
    waitlistUpdated?: boolean;
  }> {
    const email = dto.email.toLowerCase();

    const existing = await this.em.findOne(User, { email });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    // Merge any provided metadata with auth information
    const metadata: Record<string, unknown> = {
      ...(dto.metadata ?? {}),
      auth: {
        ...(dto.metadata?.['auth'] as Record<string, unknown> | undefined),
        passwordHash: dto.hashedPassword,
      },
    };

    const user = this.em.create(User, {
      email,
      displayName: dto.displayName,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(user);

    const now = new Date();
    let waitlistUpdated = false;

    // Promote existing waitlist entry or create a new one (if context provided)
    let waitlist = await this.em.findOne(WaitlistEntry, { email });

    if (waitlist) {
      waitlist.status = 'joined';
      waitlist.joinedAt = now;
      waitlist.user = user;
      waitlistUpdated = true;
    } else if (dto.source || dto.refCode || dto.cohort || dto.metadata) {
      waitlist = this.em.create(WaitlistEntry, {
        email,
        name: user.displayName,
        source: dto.source,
        refCode: dto.refCode,
        cohort: dto.cohort,
        status: 'joined',
        appliedAt: now,
        invitedAt: null,
        joinedAt: now,
        metadata: dto.metadata ?? {},
        createdAt: now,
        updatedAt: now,
        user,
      });
      this.em.persist(waitlist);
      waitlistUpdated = true;
    }

    await this.em.flush();

    const shouldCreateToken = dto.createVerificationToken !== false;

    if (!shouldCreateToken) {
      return {
        user,
        waitlistUpdated,
      };
    }

    const tokenResult = await this.verificationTokenService.createToken({
      userId: user.id,
      identifier: email,
    });

    return {
      user,
      verificationToken: tokenResult.token,
      verificationExpiresAt: tokenResult.expires,
      waitlistUpdated,
    };
  }
}
