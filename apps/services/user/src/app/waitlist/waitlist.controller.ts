import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query, // ⬅ add this
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import {
  CreateWaitlistDto,
  UpdateWaitlistStatusDto,
} from './waitlist.dto';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  async create(
    @Body() body: any, // accept whatever (can be empty)
    @Query('email') emailFromQuery?: string,
  ) {
    const dto: CreateWaitlistDto = {
      ...(body ?? {}),
      email: (body?.email ?? emailFromQuery) as string,
    };

    return this.waitlistService.create(dto);
  }

  @Get()
  async findAll() {
    return this.waitlistService.findAll();
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string) {
    return this.waitlistService.findByEmail(email);
  }

  @Patch(':email/status')
  async updateStatus(
    @Param('email') email: string,
    @Body() body: UpdateWaitlistStatusDto,
  ) {
    return this.waitlistService.updateStatus(email, body.status);
  }
}
