import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { backendDtos } from '@repo/shared';
import { CacheKey, RedisService, TTL } from 'src/redis/redis.service';

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createTenant(req, data: backendDtos.CreateTenantDto) {
    const existingOwner = await this.prisma.tenant.findFirst({
      where: { ownerId: String(req.user.id) },
    });
    if (existingOwner)
      throw new BadRequestException('User already has a tenant');
    const subdomainTaken = await this.prisma.tenant.findUnique({
      where: { subdomain: data.subdomain },
    });
    if (subdomainTaken) throw new ConflictException('Subdomain already taken');

    return this.prisma.tenant.create({
      data: {
        name: data.name,
        email: data.email,
        subdomain: data.subdomain,
        status: data.status,
        ownerId: String(req.user.id),
      },
    });
  }

  async publishTenantWebsite(userId: string) {
    const tenant = await this.getTenantDetails(userId);

    return this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { published: true },
    });
  }

  async getTenantDetails(userId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { ownerId: userId },
    });

    if (!tenant) throw new ConflictException('User donot have tenant');
    return tenant;
  }

  async getTenantDetailsBySubdomain(subdomain: string) {
    const cacheKey = CacheKey.storeTenant(subdomain);
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
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
    const result = {
      existingTenant,
      existingSetting,
      logo,
      favicon,
    };
    await this.redis.set(cacheKey, result, TTL.STORE_TENANT);
    return result;
  }

  async updateTenant(req, data: backendDtos.UpdateTenantDto) {
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { ownerId: String(req.user.id) },
    });

    if (!existingTenant) {
      throw new BadRequestException('User dont have a tenant to update');
    }

    if (data.subdomain && data.subdomain !== existingTenant.subdomain) {
      const subdomainTaken = await this.prisma.tenant.findUnique({
        where: { subdomain: data.subdomain },
      });

      if (subdomainTaken) {
        throw new ConflictException('Subdomain already taken');
      }
    }

    const tenant = await this.prisma.tenant.update({
      where: {
        ownerId: String(req.user.id),
      },
      data: {
        name: data.name,
        email: data.email,
        subdomain: data.subdomain,
        status: data.status,
        published: data.published,
      },
    });

    // Invalidate storefront cache for old subdomain (and new, if changed)
    this.redis
      .del(CacheKey.storeTenant(existingTenant.subdomain))
      .catch(() => {});
    if (data.subdomain && data.subdomain !== existingTenant.subdomain) {
      this.redis.del(CacheKey.storeTenant(data.subdomain)).catch(() => {});
    }

    return tenant;
  }

  async deleteTenant(req) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!existingTenant) throw new ConflictException('User donot have tenants');

    await this.prisma.tenant.delete({
      where: {
        ownerId: String(req.user.id),
      },
    });
    this.redis
      .del(CacheKey.storeTenant(existingTenant.subdomain))
      .catch(() => {});
  }
}
