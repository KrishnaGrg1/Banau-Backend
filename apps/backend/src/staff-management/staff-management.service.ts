import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantStaff } from '@repo/db/dist/generated/prisma/client';
import { backendDtos } from '@repo/shared';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheKey, RedisService } from 'src/redis/redis.service';
import * as xlsx from 'xlsx';
import * as Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
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

    const cacheKey = CacheKey.staffList(tenant.id, page, limit);

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
    const cacheKey = CacheKey.staffExport(existingTenant.id);
    let cache = (await this.redis.get(cacheKey)) as TenantStaff[];

    if (!cache) {
      cache = await this.prisma.tenantStaff.findMany({
        where: {
          tenantId: String(existingTenant.id),
        },
      });

      await this.redis.set(cacheKey, cache, 3600);
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

  async getStaffById(req, staffId: string) {
    const existingTenant = await this.getTenant(req);
    const cacheKey = CacheKey.staffById(existingTenant.id, staffId);
    const cache = await this.redis.get(cacheKey);
    if (cache) {
      return cache;
    }
    const existingStaff = await this.prisma.tenantStaff.findUnique({
      where: {
        id: String(staffId),
        tenantId: String(existingTenant.id),
      },
    });
    if (!existingStaff) throw new NotFoundException('Staff doesnt exist');
    await this.redis.set(cacheKey, existingStaff, 3600);
    return existingStaff;
  }

  async createTenantStaffMember(req, dto: backendDtos.CreateTenantStaffDto) {
    const existingTenant = await this.getTenant(req);

    const exisitngUser = await this.prisma.user.findUnique({
      where: {
        email: String(dto.email),
      },
    });
    if (exisitngUser) {
     throw new ConflictException('Email already exists');
    }
    const tempPassword = uuidv4().replace(/-/g, '').slice(0, 12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: hashedPassword,
      },
    });
    const newStaffMember = await this.prisma.tenantStaff.create({
      data: {
        tenantId: existingTenant.id.toString(),
        userId: newUser.id.toString(),
        canManageCustomers: dto.canManageCustomers,
        canManageOrders: dto.canManageOrders,
        canManageProducts: dto.canManageProducts,
        canManageStaff: dto.canManageStaff,
        canViewAnalytics: dto.canViewAnalytics,
      },
    });
    await this.emailService.sendStaffWelcomeEmail({
      to: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      tempPassword,
    });

    await this.redis.invalidateByPrefix(CacheKey.staffPrefix(existingTenant.id));
    return newStaffMember;
  }
}
