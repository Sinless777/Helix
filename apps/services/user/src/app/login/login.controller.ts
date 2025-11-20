// apps/services/user/src/app/login/login.controller.ts

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PermissionsSystemGuard } from '../guards/permissions-system.guard';
import { LoginService } from './login.service';

@Controller('login')
@UseGuards(PermissionsSystemGuard)
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  /**
   * Login endpoint.
   * Only available when permissionsSystem is enabled.
   */
  @Post()
  async login(@Body() body: any) {
    return this.loginService.login(body);
  }
}
