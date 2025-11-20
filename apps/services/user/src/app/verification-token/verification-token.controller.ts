import { Body, Controller, Post } from '@nestjs/common';
import { VerificationTokenService } from './verification-token.service';
import { CreateVerificationTokenDto, VerifyTokenDto } from './verification-token.dto';

@Controller('verification-tokens')
export class VerificationTokenController {
  constructor(private readonly service: VerificationTokenService) {}

  /**
   * Request a new verification token.
   * Typically used for:
   * - email verification
   * - password reset
   * - MFA setup
   *
   * The raw token should be sent to the user via email/SMS/etc.
   */
  @Post()
  async create(@Body() dto: CreateVerificationTokenDto) {
    return this.service.createToken(dto);
  }

  /**
   * Verify and consume a token.
   * If successful, the token is deleted and the user/identifier
   * are returned to the caller.
   */
  @Post('verify')
  async verify(@Body() dto: VerifyTokenDto) {
    return this.service.verifyAndConsume(dto);
  }
}
