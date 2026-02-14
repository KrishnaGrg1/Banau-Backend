import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'src/common';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { AdminServices } from './admin.services';
import { backendDtos } from '@repo/shared';


@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminServices: AdminServices) {}
  @Get('users')
  async getAllUser(@Query() paginationDto: backendDtos.PaginationDto) {
    return await this.adminServices.getAllUser(paginationDto);
  }
}
