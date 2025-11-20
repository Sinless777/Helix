// apps/services/user/src/app/org/org.module.ts

import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Org, OrgMember, OrgSettings, User } from '@helix-ai/db/entities';
import { OrgService } from './org.service';
import { OrgController } from './org.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Org, OrgMember, OrgSettings, User])],
  controllers: [OrgController],
  providers: [OrgService],
  exports: [OrgService],
})
export class OrgModule {}
