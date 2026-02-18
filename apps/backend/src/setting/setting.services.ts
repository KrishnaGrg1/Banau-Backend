import { ConflictException, Injectable } from '@nestjs/common';
import { AssetType } from '@repo/db/dist/generated/prisma/enums';
import { backendDtos } from '@repo/shared';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SettingServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
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
    if (!setting) throw new ConflictException('Tenant donot have setting');

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

    const existingSetting = await this.prisma.setting.findUnique({
      where: { tenantId: String(tenant.id) },
    });
    if (existingSetting)
      throw new ConflictException('Tenant already have setting');

    // files.logo and files.favicon are already single files
    const logoFile = files.logo;
    const faviconFile = files.favicon;

    // Upload
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

    // DB transaction
    return await this.prisma.$transaction(async (tx) => {
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
      throw new ConflictException('Tenant Setting not exist');
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
