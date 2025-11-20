import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User, UserVerificationToken } from '@helix-ai/db/entities';
import { VerificationTokenService } from './verification-token.service';
import { VerificationTokenController } from './verification-token.controller';

@Module({
  imports: [MikroOrmModule.forFeature([User, UserVerificationToken])],
  controllers: [VerificationTokenController],
  providers: [VerificationTokenService],
  exports: [VerificationTokenService],
})
export class VerificationTokenModule {}
