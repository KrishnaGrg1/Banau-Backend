import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { ApiResponseDto, AuthGuard } from 'src/common';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { AdminServices } from './admin.services';
import { backendDtos } from '@repo/shared';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminServices: AdminServices) {}

  @Get()
  async getAdminOverview() {
    const data = await this.adminServices.getAdminOverview();
    return ApiResponseDto.success(data, 'Retrieved admin overview successfully');
  }

  @Get('analytics')
  async getAnalyticsOverview() {
    const data = await this.adminServices.getAnalyticsOverview();
    return ApiResponseDto.success(
      data,
      'Retrieved analytics overview successfully',
    );
  }

  @Get('analytics/growth')
  async getGrowthMetrics() {
    const data = await this.adminServices.getGrowthMetrics();
    return ApiResponseDto.success(data, 'Retrieved growth metrics successfully');
  }

  @Get('analytics/revenue')
  async getRevenueMetrics() {
    const data = await this.adminServices.getRevenueMetrics();
    return ApiResponseDto.success(data, 'Retrieved revenue metrics successfully');
  }

  @Get('users')
  async getAllUser(@Query() paginationDto: backendDtos.PaginationDto) {
    const data = await this.adminServices.getAllUser(paginationDto);
    return ApiResponseDto.success(data, 'Retrieved all users successfully');
  }

  @Get('users/roles')
  async getUserRoles() {
    const data = await this.adminServices.getUserRoles();
    return ApiResponseDto.success(data, 'Retrieved user roles successfully');
  }

  @Get('users/:id')
  async getUserByIdV2(@Param('id') userId: string) {
    const data = await this.adminServices.getUserById(userId);
    return ApiResponseDto.success(
      data,
      'Retrieved user by userId successfully',
    );
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

  @Get('tenants/:id')
  async getTenantById(@Param('id') tenantId: string) {
    const data = await this.adminServices.getTenantById(tenantId);
    return ApiResponseDto.success(
      data,
      'Retrieved tenant by tenantId successfully',
    );
  }

  @Get('setting/features')
  async getFeatureFlags() {
    const data = await this.adminServices.getFeatureFlags();
    return ApiResponseDto.success(data, 'Retrieved feature flags successfully');
  }

  @Get('setting/plans')
  async getPlanManagement() {
    const data = await this.adminServices.getPlanManagement();
    return ApiResponseDto.success(data, 'Retrieved plans successfully');
  }

  @Get('setting/system')
  async getSystemSettings() {
    const data = await this.adminServices.getSystemSettings();
    return ApiResponseDto.success(data, 'Retrieved system settings successfully');
  }
}
