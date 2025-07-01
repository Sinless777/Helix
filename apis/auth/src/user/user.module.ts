import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { User } from './user.entity'
import { UserService } from './user.service'
import { UserController } from './user.controller'

/**
 * UserModule handles user data operations, including
 * creation, retrieval, update, and deletion of users.
 */
@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Exported for use in other modules like Auth
})
export class UserModule {}
