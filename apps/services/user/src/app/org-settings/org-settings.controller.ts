// apps/services/user/src/app/org-settings/org-settings.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrgSettingsService } from './org-settings.service';
import { UpdateOrgSettingsDto } from './org-settings.dto';

@Controller('org-settings')
export class OrgSettingsController {
  constructor(private readonly service: OrgSettingsService) {}

  /**
   * Get OrgSettings for an org, or null if not created.
   */
  @Get(':orgId')
  get(@Param('orgId') orgId: string) {
    return this.service.get(orgId);
  }

  /**
   * Ensure OrgSettings row exists for an org (idempotent).
   */
  @Post(':orgId/init')
  init(@Param('orgId') orgId: string) {
    return this.service.ensure(orgId);
  }

  /**
   * Update OrgSettings (shallow merge per JSON field).
   */
  @Patch(':orgId')
  update(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrgSettingsDto,
  ) {
    return this.service.update(orgId, dto);
  }
}
