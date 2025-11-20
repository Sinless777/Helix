// apps/services/user/src/app/signup/signup.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupDto, CheckEmailResponseDto } from './signup.dto';
import { PermissionsSystemGuard } from '../guards/permissions-system.guard';

@Controller('signup')
@UseGuards(PermissionsSystemGuard)
export class SignupController {
  constructor(private readonly service: SignupService) {}

  /**
   * Check whether an email is available for signup.
   * (Only available when permissionsSystem is enabled)
   */
  @Get('check-email/:email')
  async checkEmail(
    @Param('email') email: string,
  ): Promise<CheckEmailResponseDto> {
    const available = await this.service.isEmailAvailable(email);
    return { available };
  }

  /**
   * Perform signup flow:
   * - (Optionally) attach to waitlist
   * - Create or reuse user
   * - Optionally issue verification token
   *
   * Only available when permissionsSystem is enabled.
   */
  @Post()
  async signup(@Body() dto: SignupDto) {
    return this.service.signup(dto);
  }
}
