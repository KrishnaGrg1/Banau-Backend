import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { UserServices } from './user.service';
import { AuthGuard, User, ApiResponseDto } from 'src/common';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private userServices: UserServices) {}

  @Get('/me')
  async getMe(@User('id') userId: string) {
    const data = await this.userServices.getMe(userId);
    return ApiResponseDto.success(data, 'User data retrieved successfully');
  }
}
