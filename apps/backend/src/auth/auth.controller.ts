import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Response,
  Put,
  Get,
  Query,
  Logger,
} from '@nestjs/common';
import  {backendDtos } from '@repo/shared';
import { AuthServices } from './auth.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RefreshGuard } from 'src/common/guard/refresh.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly userServies: AuthServices) {}

  @Post('register')
  async register(@Body() createUserDto: backendDtos.CreateUserDto) {
    const data = await this.userServies.register(createUserDto);
    return ApiResponseDto.success(data, 'Registered successful');
  }

  @Put('verify')
  async verifyUser(@Body() verifyUserDto: backendDtos.VerifyUserDto) {
    await this.userServies.verifyEmail(verifyUserDto);
    return ApiResponseDto.success('Verify User successfully');
  }
  @Post('login')
  async login(@Body() dto: backendDtos.LoginDto, @Response({ passthrough: true }) res) {
    const data = await this.userServies.login(dto, res);
    return ApiResponseDto.success(data, 'Login successfully');
  }

  @Get('verify-email')
  async verifyUserByQuery(
    @Query('token') token: string,
    @Query('id') userId: string,
  ) {
    await this.userServies.verifyEmailByQuery(token, userId);
    return ApiResponseDto.success(null, 'User verified successfully');
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Request() req, @Response({ passthrough: true }) res) {
    const data = await this.userServies.logout(req, res);
    return ApiResponseDto.success(data, 'Logout Successfully');
  }

  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(@Request() req, @Response({ passthrough: true }) res) {
    Logger.log('refreshing getting hit');
    const data = await this.userServies.refreshToken(req, res);
    return ApiResponseDto.success(
      data,
      'Refresh the token both:accesstoken, refreshToken successfully',
    );
  }
}
