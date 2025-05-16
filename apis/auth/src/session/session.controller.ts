import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { Session } from './session.entity';
import { User } from '../user/user.entity';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Create a session for a user (useful for programmatic testing or internal logic).
   */
  @Post('create')
  async create(@Body() body: {
    userId: string;
    ipAddress: string;
    userAgent: string;
    geoLocation?: string;
    geoIP?: string;
  }): Promise<Session> {
    const user = await this.sessionService.em.findOne(User, { id: body.userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.sessionService.createSession(
      user,
      body.ipAddress,
      body.userAgent,
      body.geoLocation,
      body.geoIP,
    );
  }

  /**
   * Get a session by its ID.
   */
  @Get(':id')
  async getSession(@Param('id') id: string): Promise<Session> {
    const session = await this.sessionService.findById(id);
    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
    return session;
  }

  /**
   * Get all sessions for a given user ID.
   */
  @Get('user/:userId')
  async getUserSessions(@Param('userId') userId: string): Promise<Session[]> {
    const user = await this.sessionService.em.findOne(User, { id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.sessionService.findAllByUser(user);
  }

  /**
   * Revoke a session by ID.
   */
  @Post('revoke/:id')
  async revoke(@Param('id') id: string): Promise<Session | null> {
    return this.sessionService.revokeSession(id);
  }

  /**
   * Revoke all sessions for a user.
   */
  @Post('revoke-all/:userId')
  async revokeAll(@Param('userId') userId: string): Promise<Session[]> {
    const user = await this.sessionService.em.findOne(User, { id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.sessionService.revokeAllSessionsForUser(user);
  }

  /**
   * Delete a session by ID.
   */
  @Delete(':id')
  async deleteSession(@Param('id') id: string): Promise<void> {
    await this.sessionService.deleteSession(id);
  }

  /**
   * Delete all sessions for a user.
   */
  @Delete('user/:userId')
  async deleteAllSessions(@Param('userId') userId: string): Promise<void> {
    const user = await this.sessionService.em.findOne(User, { id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.sessionService.deleteAllSessionsForUser(user);
  }

  /**
   *  Find a session by its ID.
   * @param id - The ID of the session to find.
   * @throws {HttpException} If the session is not found.
   * @returns 
   */
  async findSessionById(id: string): Promise<Session | null> {
    const session = await this.sessionService.findById(id);
    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
    return session;
  }

  /**
   * 
   * @param id - The ID of the session to revoke.
   * @throws {HttpException} If the session is not found.
   * @returns 
   */
  revokeSession(id: string): Promise<Session | null> {
    return this.sessionService.revokeSession(id);
  }

  /**
   * Get all sessions for a user.
   * @param user - The user whose sessions to retrieve.
   * @throws {HttpException} If the user is not found.
   * @returns The user's sessions.
   */
  async getSessionsForUser(user: User): Promise<Session[]> {
    const sessions = await this.sessionService.findAllByUser(user);
    if (!sessions) {
      throw new HttpException('No sessions found for user', HttpStatus.NOT_FOUND);
    }
    return sessions;
  }
}
