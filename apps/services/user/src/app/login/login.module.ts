// apps/services/user/src/app/login/login.module.ts
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '@helix-ai/db/entities';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { SessionModule } from '../session/session.module';
import { PermissionsSystemGuard } from '../guards/permissions-system.guard';

@Module({
  imports: [MikroOrmModule.forFeature([User]), SessionModule],
  controllers: [LoginController],
  providers: [LoginService, PermissionsSystemGuard],
  exports: [LoginService],
})
export class LoginModule {}
