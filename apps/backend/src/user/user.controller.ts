import { Controller, Get, Logger, Request, UseGuards } from '@nestjs/common';
import { UserServices } from './user.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ApiResponseDto } from 'src/common/dto/response.dto';

@Controller('user')
export class UserController {
  constructor(private userServices: UserServices) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  async getMe(@Request() req) {
    const data = await this.userServices.getMe(req.user.id);
    Logger.log('data', data);
    return ApiResponseDto.success(data, 'User data retrieved successfully');
  }
}
