// apps/services/user/src/app/org-member/org-member.module.ts

import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Org, OrgMember, User } from '@helix-ai/db/entities';
import { OrgMemberService } from './org-member.service';
import { OrgMemberController } from './org-member.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Org, OrgMember, User])],
  controllers: [OrgMemberController],
  providers: [OrgMemberService],
  exports: [OrgMemberService],
})
export class OrgMemberModule {}
