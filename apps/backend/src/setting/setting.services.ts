// apps/api/src/setting/setting.services.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetType } from '@repo/db/dist/generated/prisma/enums';
import { backendDtos } from '@repo/shared';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheKey, RedisService } from 'src/redis/redis.service';

@Injectable()
export class SettingServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly redis: RedisService,
  ) {}

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
    if (!setting) throw new ConflictException('Tenant does not have settings');

    return setting;
  }

  async createTenantSetting(
    req,
    data: backendDtos.CreateTenantSettingDto,
    files: { logo?: Express.Multer.File; favicon?: Express.Multer.File },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { ownerId: String(req.user.id) },
    });
    if (!tenant) throw new ConflictException('Tenant not exist');

    // ✅ Check if settings already exist
    const existingSetting = await this.prisma.setting.findUnique({
      where: { tenantId: String(tenant.id) },
    });
    if (existingSetting)
      throw new ConflictException(
        'Tenant already has settings. Use PUT to update.',
      );

    const logoFile = files.logo;
    const faviconFile = files.favicon;

    let uploadedLogo;
    let uploadedFavicon;

    if (logoFile) {
      uploadedLogo = await this.cloudinaryService.uploadFile(
        logoFile,
        `tenants/${tenant.id}`,
        'logo',
      );
    }

    if (faviconFile) {
      uploadedFavicon = await this.cloudinaryService.uploadFile(
        faviconFile,
        `tenants/${tenant.id}`,
        'favicon',
      );
    }

    const created = await this.prisma.$transaction(async (tx) => {
      let logoId: string | null = null;
      let faviconId: string | null = null;

      if (uploadedLogo) {
        const asset = await tx.asset.create({
          data: {
            fileName: logoFile!.originalname,
            url: uploadedLogo.secure_url,
            type: AssetType.LOGO,
            tenantId: String(tenant.id),
            fileSize: logoFile!.size,
            mimeType: logoFile!.mimetype,
          },
        });
        logoId = asset.id;
      }

      if (uploadedFavicon) {
        const asset = await tx.asset.create({
          data: {
            fileName: faviconFile!.originalname,
            url: uploadedFavicon.secure_url,
            type: AssetType.FAVICON,
            tenantId: String(tenant.id),
            fileSize: faviconFile!.size,
            mimeType: faviconFile!.mimetype,
          },
        });
        faviconId = asset.id;
      }

      return tx.setting.create({
        data: {
          primaryColorCode: data.primaryColorCode,
          secondaryColorCode: data.secondaryColorCode,
          primaryTextColorCode: data.primaryTextColorCode,
          secondaryTextColorCode: data.secondaryTextColorCode,
          backgroundColorCode: data.backgroundColorCode,
          backgroundTextColorCode: data.backgroundTextColorCode,
          landingPageTitle: data.landingPageTitle,
          landingPageDescription: data.landingPageDescription,
          logoId,
          faviconId,
          tenantId: String(tenant.id),
        },
      });
    });

    this.redis.del(CacheKey.storeTenant(tenant.subdomain)).catch(() => {});
    return created;
  }

  // ✅ NEW: Update method
  async updateTenantSetting(
    req,
    data: backendDtos.CreateTenantSettingDto,
    files: { logo?: Express.Multer.File; favicon?: Express.Multer.File },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { ownerId: String(req.user.id) },
    });
    if (!tenant) throw new ConflictException('Tenant not exist');

    // ✅ Check if settings exist
    const existingSetting = await this.prisma.setting.findUnique({
      where: { tenantId: String(tenant.id) },
    });
    if (!existingSetting)
      throw new NotFoundException('Settings not found. Use POST to create.');

    const logoFile = files.logo;
    const faviconFile = files.favicon;

    let uploadedLogo;
    let uploadedFavicon;

    // Upload new files if provided
    if (logoFile) {
      uploadedLogo = await this.cloudinaryService.uploadFile(
        logoFile,
        `tenants/${tenant.id}`,
        'logo',
      );
    }

    if (faviconFile) {
      uploadedFavicon = await this.cloudinaryService.uploadFile(
        faviconFile,
        `tenants/${tenant.id}`,
        'favicon',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let logoId = existingSetting.logoId;
      let faviconId = existingSetting.faviconId;
      const oldLogoId = existingSetting.logoId;
      const oldFaviconId = existingSetting.faviconId;

      // Create new logo asset first (before touching the old one)
      if (uploadedLogo) {
        const newLogo = await tx.asset.create({
          data: {
            fileName: logoFile!.originalname,
            url: uploadedLogo.secure_url,
            type: AssetType.LOGO,
            tenantId: String(tenant.id),
            fileSize: logoFile!.size,
            mimeType: logoFile!.mimetype,
          },
        });
        logoId = newLogo.id;
      }

      // Create new favicon asset first (before touching the old one)
      if (uploadedFavicon) {
        const newFavicon = await tx.asset.create({
          data: {
            fileName: faviconFile!.originalname,
            url: uploadedFavicon.secure_url,
            type: AssetType.FAVICON,
            tenantId: String(tenant.id),
            fileSize: faviconFile!.size,
            mimeType: faviconFile!.mimetype,
          },
        });
        faviconId = newFavicon.id;
      }

      // Update setting (drops FK references to old assets)
      const result = await tx.setting.update({
        where: { tenantId: String(tenant.id) },
        data: {
          primaryColorCode: data.primaryColorCode,
          secondaryColorCode: data.secondaryColorCode,
          primaryTextColorCode: data.primaryTextColorCode,
          secondaryTextColorCode: data.secondaryTextColorCode,
          backgroundColorCode: data.backgroundColorCode,
          backgroundTextColorCode: data.backgroundTextColorCode,
          landingPageTitle: data.landingPageTitle,
          landingPageDescription: data.landingPageDescription,
          logoId,
          faviconId,
        },
      });

      // Now safe to delete old assets (setting no longer references them)
      if (uploadedLogo && oldLogoId) {
        await tx.asset.delete({ where: { id: oldLogoId } });
      }
      if (uploadedFavicon && oldFaviconId) {
        await tx.asset.delete({ where: { id: oldFaviconId } });
      }

      return result;
    });

    this.redis.del(CacheKey.storeTenant(tenant.subdomain)).catch(() => {});
    return updated;
  }

  async getTenantAssets(req) {
    const userId = String(req.user.id);
    const existingTenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: userId,
      },
    });
    if (!existingTenant) throw new ConflictException('Tenant not found');

    const existingSetting = await this.prisma.setting.findFirst({
      where: {
        tenantId: existingTenant.id.toString(),
      },
    });
    if (!existingSetting)
      throw new ConflictException('Tenant settings do not exist');

    const [logo, favicon] = await Promise.all([
      this.prisma.asset.findFirst({
        where: {
          type: 'LOGO',
          tenantId: existingTenant.id,
        },
      }),
      this.prisma.asset.findFirst({
        where: {
          type: 'FAVICON',
          tenantId: existingTenant.id,
        },
      }),
    ]);

    return {
      logo,
      favicon,
    };
  }
}
