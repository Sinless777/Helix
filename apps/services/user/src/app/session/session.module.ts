import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User, UserSession } from '@helix-ai/db/entities';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [MikroOrmModule.forFeature([User, UserSession])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
