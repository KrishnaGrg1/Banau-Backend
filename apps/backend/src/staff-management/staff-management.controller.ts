import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { backendDtos } from '@repo/shared';
import { ApiResponseDto, AuthGuard } from 'src/common';
import { TenantOwnerGuard } from 'src/common/guard/tenant-owner.guard';
import { StaffManagementService } from './staff-management.service';

@Controller('staff-management')
export class StaffManagementController {
  constructor(
    private readonly staffManagementService: StaffManagementService,
  ) {}

  @UseGuards(AuthGuard, TenantOwnerGuard)
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

  @UseGuards(AuthGuard, TenantOwnerGuard)
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

  // PUBLIC — no guards
  @Post('accept-invite')
  async acceptInvite(@Body() dto: backendDtos.AcceptInviteDto) {
    const data = await this.staffManagementService.acceptInvite(dto);
    return ApiResponseDto.success(data, 'Invitation accepted successfully');
  }

  @UseGuards(AuthGuard, TenantOwnerGuard)
  @Post('invite')
  async inviteStaffMember(
    @Request() req,
    @Body() dto: backendDtos.InviteStaffDto,
  ) {
    await this.staffManagementService.inviteStaffMember(req, dto);
    return ApiResponseDto.success('Invitation sent successfully');
  }

  @UseGuards(AuthGuard, TenantOwnerGuard)
  @Post('')
  async createStaffMember(
    @Request() req,
    @Body() dto: backendDtos.CreateTenantStaffDto,
  ) {
    const data = await this.staffManagementService.createTenantStaffMember(
      req,
      dto,
    );
    return ApiResponseDto.success(data, "Created staff memeber's successfully");
  }

  @UseGuards(AuthGuard, TenantOwnerGuard)
  @Get(':id/activity')
  async getStaffActivity(@Request() req, @Param('id') id: string) {
    const data = await this.staffManagementService.getStaffActivity(req, id);
    return ApiResponseDto.success(
      data,
      'Retrieved staff activity successfully',
    );
  }

  @UseGuards(AuthGuard, TenantOwnerGuard)
  @Get(':id')
  async getStaffById(@Request() req, @Param('id') id: string) {
    const data = await this.staffManagementService.getStaffById(req, id);
    return ApiResponseDto.success(data, 'Retrieved staff member successfully');
  }

  @UseGuards(AuthGuard, TenantOwnerGuard)
  @Delete(':id')
  async deleteStaffById(@Request() req, @Param('id') id: string) {
    await this.staffManagementService.deleteStaffMember(req, id);
    return ApiResponseDto.success(null, 'Staff member deleted successfully');
  }

  @UseGuards(AuthGuard, TenantOwnerGuard)
  @Put(':id')
  async updateStaffPermission(
    @Request() req,
    @Param('id') staffId: string,
    @Body() dto: backendDtos.UpdateTenantStaffPermission,
  ) {
    const data = await this.staffManagementService.updateStaffPermission(
      req,
      staffId,
      dto,
    );
    return ApiResponseDto.success(data, 'Updated the staff member permission');
  }
}
