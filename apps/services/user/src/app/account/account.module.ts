import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User, UserAccount } from '@helix-ai/db/entities';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

@Module({
  imports: [MikroOrmModule.forFeature([User, UserAccount])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
