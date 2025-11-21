import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User, WaitlistEntry, UserVerificationToken } from '@helix-ai/db/entities';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { VerificationTokenModule } from '../verification-token/verification-token.module';
import { PermissionsSystemGuard } from '../guards/permissions-system.guard';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, WaitlistEntry, UserVerificationToken]),
    VerificationTokenModule,
  ],
  controllers: [SignupController],
  providers: [SignupService, PermissionsSystemGuard],
  exports: [SignupService],
})
export class SignupModule {}
