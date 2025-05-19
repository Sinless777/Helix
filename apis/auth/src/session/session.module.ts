import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Session } from './session.entity'
import { SessionService } from './session.service'
import { SessionController } from './session.controller'
import { User } from '../user/user.entity'

/**
 * SessionModule handles all session-related features including:
 * - Creation
 * - Revocation
 * - Deletion
 * - Lookup of user sessions
 */
@Module({
  imports: [MikroOrmModule.forFeature([Session, User])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService], // allows other modules (e.g. Auth) to use SessionService
})
export class SessionModule {}
