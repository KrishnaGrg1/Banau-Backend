import {
    Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { backendDtos } from '@repo/shared';
import { ApiResponseDto, AuthGuard } from 'src/common';
import { TenantOwnerGuard } from 'src/common/guard/tenant-owner.guard';
import { StaffManagementService } from './staff-management.service';

@UseGuards(AuthGuard, TenantOwnerGuard)
@Controller('staff-management')
export class StaffManagementController {
  constructor(
    private readonly staffManagementService: StaffManagementService,
  ) {}

  @Get('')
  async listAllStaff(
    @Request() req,
    @Query() paginationDto: backendDtos.PaginationDto,
  ) {
    const data = await this.staffManagementService.listAllStaff(
      req,
      paginationDto,
    );
    return ApiResponseDto.success(data, "Retrieved all tenant's customers");
  }

  @Get('export')
  async exportStaffMembers(
    @Request() req,
    @Response({ passthrough: false }) res,
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
  ) {
    const { buffer, filename, mimeType } =
      await this.staffManagementService.exportStaffMembers(req, format);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Post('')
  async createStaffMember(
    @Request()req,
    @Body()dto:backendDtos.CreateTenantStaffDto
  ){
    const data=await this.staffManagementService.createTenantStaffMember(req,dto)
    return ApiResponseDto.success(data, "Created staff memeber's successfully"); 
  }
}
