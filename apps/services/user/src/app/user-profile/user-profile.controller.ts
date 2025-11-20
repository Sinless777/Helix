import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UpdateUserProfileDto } from './user-profile.dto';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly service: UserProfileService) {}

  @Get(':userId')
  getByUserId(@Param('userId') userId: string) {
    return this.service.getByUserId(userId);
  }

  @Get('handle/:handle')
  getByHandle(@Param('handle') handle: string) {
    return this.service.getByHandle(handle);
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.service.update(userId, dto);
  }
}
