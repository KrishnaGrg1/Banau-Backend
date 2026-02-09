import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CreateTenantDto } from '@repo/shared';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async createTenant(req, data: CreateTenantDto) {
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

    if (!tenant) throw new ConflictException('Tenant not found');
    return tenant;
  }

  async getTenantDetailsBySubdomain(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) throw new ConflictException('Tenant not found');
    return tenant;
  }
}
