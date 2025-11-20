// apps/services/user/src/app/org-member/org-member.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrgMemberService } from './org-member.service';
import { AddOrgMemberDto, UpdateOrgMemberDto } from './org-member.dto';

@Controller('org-members')
export class OrgMemberController {
  constructor(private readonly service: OrgMemberService) {}

  // Add a member
  @Post()
  add(@Body() dto: AddOrgMemberDto) {
    return this.service.addMember(dto);
  }

  // List all members of an org
  @Get('org/:orgId')
  listMembers(@Param('orgId') orgId: string) {
    return this.service.listMembers(orgId);
  }

  // List all orgs a user belongs to
  @Get('user/:userId')
  listOrgs(@Param('userId') userId: string) {
    return this.service.listOrgsForUser(userId);
  }

  // Update role / attributes
  @Patch(':orgId/:userId')
  update(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateOrgMemberDto,
  ) {
    return this.service.updateMember(orgId, userId, dto);
  }

  // Remove member
  @Delete(':orgId/:userId')
  remove(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.removeMember(orgId, userId);
  }
}
