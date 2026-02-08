import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import type { CreateTenantDto } from '@repo/shared';
import { User } from 'src/common/decorators/user.decorator';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantsService: TenantService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@User('id') userId: string, @Body() dto: CreateTenantDto) {
    const data = await this.tenantsService.addDomain(userId, dto);
    return ApiResponseDto.success(data, 'Domain added successfully');
  }

  @UseGuards(AuthGuard)
  @Put('publish')
  async publish(@User('id') userId: string) {
    const data = await this.tenantsService.publishTenantWebsite(userId);
    return ApiResponseDto.success(data, 'Tenant published successfully');
  }

  @UseGuards(AuthGuard)
  @Get()
  async getDetails(@User('id') userId: string) {
    const data = await this.tenantsService.getTenantDetails(userId);
    return ApiResponseDto.success(
      data,
      'Tenant details retrieved successfully',
    );
  }

  @Get(':subdomain')
  async getBySubdomain(@Param('subdomain') subdomain: string) {
    const tenant =
      await this.tenantsService.getTenantDetailsBySubdomain(subdomain);
    return ApiResponseDto.success(
      tenant,
      'Website details retrieved successfully',
    );
  }
}
