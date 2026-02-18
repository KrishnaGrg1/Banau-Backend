// apps/api/src/setting/setting.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponseDto, AuthGuard } from 'src/common';
import { SettingServices } from './setting.services';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { backendDtos } from '@repo/shared';
import { FileSizeValidationPipe } from 'src/common/validation/fileValidation';

@UseGuards(AuthGuard)
@Controller('tenant/setting')
export class TenantSettingController {
  constructor(private readonly settingServices: SettingServices) {}

  @Get('')
  async getTenantSetting(@Request() req) {
    const data = await this.settingServices.getTenantSetting(req);
    return ApiResponseDto.success(data, 'Retrieved tenant setting');
  }

  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      },
    ),
  )
  async createTenantSetting(
    @Request() req,
    @Body() dto: backendDtos.CreateTenantSettingDto,
    @UploadedFiles(new FileSizeValidationPipe())
    files: { logo?: Express.Multer.File[]; favicon?: Express.Multer.File[] },
  ) {
    const logoFile = files.logo?.[0];
    const faviconFile = files.favicon?.[0];
    const data = await this.settingServices.createTenantSetting(req, dto, {
      logo: logoFile,
      favicon: faviconFile,
    });
    return ApiResponseDto.success(data, 'Tenant settings created');
  }

  // ✅ NEW: Update endpoint
  @Put('')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      },
    ),
  )
  async updateTenantSetting(
    @Request() req,
    @Body() dto: backendDtos.CreateTenantSettingDto,
    @UploadedFiles(new FileSizeValidationPipe())
    files: { logo?: Express.Multer.File[]; favicon?: Express.Multer.File[] },
  ) {
    const logoFile = files.logo?.[0];
    const faviconFile = files.favicon?.[0];
    const data = await this.settingServices.updateTenantSetting(req, dto, {
      logo: logoFile,
      favicon: faviconFile,
    });
    return ApiResponseDto.success(data, 'Tenant settings updated');
  }

  @Get('asset')
  async getTenantAssets(@Request() req) {
    const data = await this.settingServices.getTenantAssets(req);
    return ApiResponseDto.success(data, 'Retrieved tenant assets');
  }
}