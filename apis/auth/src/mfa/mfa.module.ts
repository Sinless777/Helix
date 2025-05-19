import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';

@Module({
  providers: [MfaService],
  controllers: [MfaController]
})
export class MfaModule {}
