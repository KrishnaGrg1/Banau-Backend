import {
  Body,
  Controller,
  Get,
  Post,
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
    return ApiResponseDto.success(data, 'Retreived tenant setting');
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

  @Get('asset')
  async getTenantAssets(@Request() req) {
    const data = await this.settingServices.getTenantAssets(req);
    return ApiResponseDto.success(data, 'Retreived tenant setting');
  }
}

// https://jobayerdev.medium.com/digitalocean-s3-nestjs-example-65bec8d059b3
