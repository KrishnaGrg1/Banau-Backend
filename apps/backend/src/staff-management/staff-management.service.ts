import { ConflictException, Injectable } from '@nestjs/common';
import { TenantStaff } from '@repo/db/dist/generated/prisma/client';
import { backendDtos } from '@repo/shared';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import * as xlsx from 'xlsx';
import * as Papa from 'papaparse';
@Injectable()
export class StaffManagementService {
  constructor(
    private readonly redis: RedisService,
    private readonly cloudinary: CloudinaryService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  private async getTenant(req) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!existingTenant) throw new ConflictException('Tenant doesnot exist');
    return existingTenant;
  }
  async listAllStaff(req: any, pagination: backendDtos.PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const tenant = await this.getTenant(req);

    const page = Math.floor(offset / limit) + 1;

    const cacheKey = `staff:${tenant.id}:${page}:${limit}`;

    // 1️⃣ Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2️⃣ Query DB
    const [existingStaff, total] = await Promise.all([
      this.prisma.tenantStaff.findMany({
        where: { tenantId: tenant.id },
        skip: offset,
        take: limit,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenantStaff.count({
        where: { tenantId: tenant.id },
      }),
    ]);

    const result = {
      data: existingStaff,
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };

    // 3️⃣ Store cache
    await this.redis.set(cacheKey, result, 3600);

    return result;
  }

  async exportStaffMembers(req, format) {
    const existingTenant = await this.getTenant(req);
    const cacheKey = `tenant:staff:${existingTenant.id}`;
    const cache = (await this.redis.get(cacheKey)) as TenantStaff[];
    if (!cache) {
      const existingStaff = await this.prisma.tenantStaff.findMany({
        where: {
          tenantId: String(existingTenant.id),
        },
      });
      const cache = await this.redis.set(cacheKey, existingStaff, 3600);
    }
    const exportData = cache.map((x) => ({
      id: x.id,
      tenantId: x.tenantId,
      userId: x.userId,
      canManageProducts: x.canManageProducts ? '✓' : '✗',
      canManageOrders: x.canManageOrders ? '✓' : '✗',
      canManageCustomers: x.canManageCustomers ? '✓' : '✗',
      canViewAnalytics: x.canViewAnalytics ? '✓' : '✗',
      canManageStaff: x.canManageStaff ? '✓' : '✗',
      createdAt: x.createdAt,
      updatedAt: x.updatedAt,
    }));

    if (format === 'csv') {
      const csv = Papa.unparse(exportData);
      return {
        buffer: Buffer.from(csv),
        filename: `staff-${Date.now()}.csv`,
        mimeType: 'text/csv',
      };
    } else {
      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Staff');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return {
        buffer: Buffer.from(buffer),
        filename: `staff-${Date.now()}.xlsx`,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
  }

  async createTenantStaffMember(req,dto:backendDtos.CreateTenantStaffDto){
        const existingTenant=await this.getTenant(req)
        
  }
}
