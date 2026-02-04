import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import type { CreateUserDto, LoginDto, RegisterResponse } from '@repo/shared';
import { AuthServices } from './auth.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly userServies: AuthServices) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const data = await this.userServies.register(createUserDto);
    return ApiResponseDto.success(data, 'Registered successful');
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Response({ passthrough: true }) res) {
    const data = await this.userServies.login(dto, res);
    return ApiResponseDto.success(data, 'Login successfully');
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Request() req, @Response({ passthrough: true }) res) {
    const data = await this.userServies.logout(req.token, res);
    return ApiResponseDto.success(data, 'Logout Successfully');
  }
}
