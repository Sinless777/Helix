import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { SessionService } from './session.service'
import { Session } from './session.entity'
import { User } from '../user/user.entity'

/**
 * Controller for managing user sessions: creation, revocation, lookup, deletion.
 */
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Creates a new session for a user.
   *
   * @param body - Session creation payload
   * @returns The created session
   * @throws {HttpException} If the user is not found
   */
  @Post('create')
  async create(
    @Body()
    body: {
      userId: string
      ipAddress: string
      userAgent: string
      geoLocation?: string
      geoIP?: string
    },
  ): Promise<Session> {
    const user = await this.sessionService.em.findOne(User, {
      id: body.userId,
    })
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    return this.sessionService.createSession(
      user,
      body.ipAddress,
      body.userAgent,
      body.geoLocation,
      body.geoIP,
    )
  }

  /**
   * Retrieves a session by its ID.
   *
   * @param id - Session ID
   * @returns The session
   * @throws {HttpException} If session is not found
   */
  @Get(':id')
  async getSession(@Param('id') id: string): Promise<Session> {
    const session = await this.sessionService.findById(id)
    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND)
    }
    return session
  }

  /**
   * Retrieves all sessions for a given user.
   *
   * @param userId - User ID
   * @returns List of sessions
   * @throws {HttpException} If user is not found
   */
  @Get('user/:userId')
  async getUserSessions(@Param('userId') userId: string): Promise<Session[]> {
    const user = await this.sessionService.em.findOne(User, { id: userId })
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    return this.sessionService.findAllByUser(user)
  }

  /**
   * Revokes a session by its ID.
   *
   * @param id - Session ID
   * @returns The revoked session
   */
  @Post('revoke/:id')
  async revoke(@Param('id') id: string): Promise<Session | null> {
    return this.sessionService.revokeSession(id)
  }

  /**
   * Revokes all sessions for a given user.
   *
   * @param userId - User ID
   * @returns All revoked sessions
   * @throws {HttpException} If user is not found
   */
  @Post('revoke-all/:userId')
  async revokeAll(@Param('userId') userId: string): Promise<Session[]> {
    const user = await this.sessionService.em.findOne(User, { id: userId })
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    return this.sessionService.revokeAllSessionsForUser(user)
  }

  /**
   * Deletes a session by its ID.
   *
   * @param id - Session ID
   * @returns Void
   * @throws {HttpException} If session is not found or invalid
   */
  @Delete(':id')
  async deleteSession(@Param('id') id: string): Promise<void> {
    await this.sessionService.deleteSession(id)
  }

  /**
   * Deletes all sessions for a user.
   *
   * @param userId - User ID
   * @returns Void
   * @throws {HttpException} If user is not found
   */
  @Delete('user/:userId')
  async deleteAllSessions(@Param('userId') userId: string): Promise<void> {
    const user = await this.sessionService.em.findOne(User, { id: userId })
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    await this.sessionService.deleteAllSessionsForUser(user)
  }
}
