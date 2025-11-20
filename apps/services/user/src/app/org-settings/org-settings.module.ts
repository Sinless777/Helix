// apps/services/user/src/app/org-settings/org-settings.module.ts

import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Org, OrgSettings } from '@helix-ai/db/entities';
import { OrgSettingsService } from './org-settings.service';
import { OrgSettingsController } from './org-settings.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Org, OrgSettings])],
  controllers: [OrgSettingsController],
  providers: [OrgSettingsService],
  exports: [OrgSettingsService],
})
export class OrgSettingsModule {}
