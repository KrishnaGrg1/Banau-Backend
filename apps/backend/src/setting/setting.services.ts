import { ConflictException, Injectable } from '@nestjs/common';
import { backendDtos } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SettingServices {
  constructor(private readonly prisma: PrismaService) {}

  async getTenantSetting(req) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!tenant) throw new ConflictException('Tenant not exist');

    const setting = await this.prisma.setting.findUnique({
      where: {
        tenantId: String(tenant.id),
      },
    });
    if (!setting) throw new ConflictException('Tenant donot have setting');

    return setting;
  }

  async createTenantSetting(
    req,
    data: backendDtos.CreateTenantSettingDto,
    files: { logo?: Express.Multer.File; favicon?: Express.Multer.File },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!tenant) throw new ConflictException('Tenant not exist');

    const setting = await this.prisma.setting.findUnique({
      where: {
        tenantId: String(tenant.id),
      },
    });
    if (setting) throw new ConflictException('Tenant already have setting');

    // const asset=await this.prisma
    const asset = 'url from uploading in cloudinary or  digital ocean';
    const newSetting = await this.prisma.setting.create({
      data: {
        primaryColorCode: data.primaryColorCode,
        secondaryColorCode: data.secondaryColorCode,
        primaryTextColorCode: data.primaryTextColorCode,
        secondaryTextColorCode: data.secondaryTextColorCode,
        backgroundColorCode: data.backgroundColorCode,
        backgroundTextColorCode: data.backgroundTextColorCode,

        landingPageTitle: data.landingPageTitle,
        landingPageDescription: data.landingPageDescription,
        tenantId: String(tenant.id),
      },
    });
  }
}
