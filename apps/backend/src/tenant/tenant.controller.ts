import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { backendDtos } from '@repo/shared';
import { User } from 'src/common/decorators/user.decorator';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantsService: TenantService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: backendDtos.CreateTenantDto) {
    const data = await this.tenantsService.createTenant(req, dto);
    return ApiResponseDto.success(data, 'Tenant added successfully');
  }

  @UseGuards(AuthGuard)
  @Put('publish')
  async publish(@User('id') userId: string) {
    const data = await this.tenantsService.publishTenantWebsite(userId);
    return ApiResponseDto.success(data, 'Tenant published successfully');
  }

  @UseGuards(AuthGuard)
  @Get()
  async getDetails(@Request() req) {
    const data = await this.tenantsService.getTenantDetails(req.user.id);
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

 @UseGuards(AuthGuard) 
  @Patch()
  async updateTenant(
    @Request() req,
    @Body() dto: backendDtos.UpdateTenantDto,
  ) {
    const tenant = await this.tenantsService.updateTenant(req,dto);
    return ApiResponseDto.success(
      tenant,
      "Updated tenant successfully"
    )
  }
 @UseGuards(AuthGuard) 
 @Delete()
 async deleteTenant(@Request() req){
  const tenant=await this.tenantsService.deleteTenant(req)
 return ApiResponseDto.success(
      tenant,
      "Deleted tenant successfully"
    ) 
 }
}
