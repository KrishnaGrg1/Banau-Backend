import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponseDto, AuthGuard } from 'src/common';
import { SettingServices } from './setting.services';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { backendDtos } from '@repo/shared';

@UseGuards(AuthGuard)
@Controller('tenant/setting')
export class TenantSetting {
  constructor(private readonly settingServices: SettingServices) {}

  @Get('')
  async getTenantSetting(@Request() req) {
    const data = await this.settingServices.getTenantSetting(req);
    return ApiResponseDto.success(data, 'Retreived tenant setting');
  }

  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ]),
  )
  async createTenantSetting(
    @Request() req,
    @Body() dto: backendDtos.CreateTenantSettingDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; favicon?: Express.Multer.File[] },
  ) {
    const logoFile = files.logo?.[0];
    const faviconFile = files.favicon?.[0];
    const data = await this.settingServices.createTenantSetting(req, dto, {
      logo: logoFile,
      favicon: faviconFile,
    });
    return ApiResponseDto.success(data, 'Tenant settings updated');
  }
}

// https://jobayerdev.medium.com/digitalocean-s3-nestjs-example-65bec8d059b3
