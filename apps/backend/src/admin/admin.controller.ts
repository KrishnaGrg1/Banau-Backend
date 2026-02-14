import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiResponseDto, AuthGuard } from 'src/common';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { AdminServices } from './admin.services';
import { backendDtos } from '@repo/shared';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminServices: AdminServices) {}

  @Get('users')
  async getAllUser(@Query() paginationDto: backendDtos.PaginationDto) {
    const data = await this.adminServices.getAllUser(paginationDto);
    return ApiResponseDto.success(data, 'Retrieved all users successfully');
  }

  @Get('user/:id')
  async getUserById(@Param('id') userId: string) {
    const data = await this.adminServices.getUserById(userId);
    return ApiResponseDto.success(
      data,
      'Retrieved user by userId successfully',
    );
  }

  @Get('tenants')
  async getAllTenants(@Query() paginationDto: backendDtos.PaginationDto) {
    const data = await this.adminServices.getAllTenants(paginationDto);
    return ApiResponseDto.success(data, 'Retrieved all tenants successfully');
  }
}
