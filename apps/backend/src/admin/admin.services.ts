import { ConflictException, Injectable } from '@nestjs/common';
import { UserRole } from '@repo/db/dist/generated/prisma/enums';
import { backendDtos } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminServices {
  constructor(private prisma: PrismaService) {}

  async getAllUser(paginationDto: backendDtos.PaginationDto) {
    const { limit = 10, offset = 0, role } = paginationDto;

    const whereCondition = {
      role: role ? role : { not: UserRole.SUPER_ADMIN },
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({
        where: whereCondition,
      }),
    ]);

    return {
      users,
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }

  async getUserById(userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) throw new ConflictException('User not found');
    return existingUser;
  }

  async getAllTenants(paginationDto: backendDtos.PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);
    return {
      tenants: tenants,
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }

  async getTenantById(tenantId: string) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
    });
    if (!existingTenant) throw new ConflictException('Tenant not found');
    return existingTenant;
  }
}
