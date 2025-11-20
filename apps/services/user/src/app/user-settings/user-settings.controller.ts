import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './user-settings.dto';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly service: UserSettingsService) {}

  @Get(':userId')
  async getSettings(@Param('userId') userId: string) {
    return this.service.getSettings(userId);
  }

  @Patch(':userId')
  async updateSettings(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    return this.service.updateSettings(userId, dto);
  }
}

