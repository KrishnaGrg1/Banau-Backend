import {
  BadRequestException,
  ConflictException,
  GoneException,
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

  async exportStaffMembers(req: any, format: string) {
    const existingTenant = await this.getTenant(req);
    const cacheKey = CacheKey.staffExport(existingTenant.id);
    let cache = (await this.redis.get(cacheKey)) as (TenantStaff & { user: any })[];

    if (!cache) {
      cache = await this.prisma.tenantStaff.findMany({
        where: {
          tenantId: String(existingTenant.id),
        },
        include: {
          user: true,
        },
      });

      await this.redis.set(cacheKey, cache, 3600);
    }
    const exportData = cache.map((x) => ({
      id: x.id,
      tenantId: x.tenantId,
      StaffMemberName: `${x.user.firstName} ${x.user.lastName}`,
      email: x.user.email,
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

  async getStaffById(req, staffId: string): Promise<TenantStaff> {
    const existingTenant = await this.getTenant(req);
    const cacheKey = CacheKey.staffById(existingTenant.id, staffId);
    const cache = await this.redis.get(cacheKey) as TenantStaff;
    if (cache) {
      return cache;
    }
    const existingStaff = await this.prisma.tenantStaff.findUnique({
      where: {
        id: String(staffId),
        tenantId: String(existingTenant.id),
      },
       include: { user: true },
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
            isVerified:true,
            role:'TENANT_STAFF',
            verifiedAt: new Date(),
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
      include:{
        user:true
      }
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

  async inviteStaffMember(
    req: any,
    dto: backendDtos.InviteStaffDto,
  ): Promise<{ message: string }> {
    const existingTenant = await this.getTenant(req);

    // Prevent duplicate invites for an already-active staff member
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      const alreadyStaff = await this.prisma.tenantStaff.findFirst({
        where: { userId: existingUser.id, tenantId: existingTenant.id },
      });
      if (alreadyStaff)
        throw new ConflictException(
          'This user is already a staff member of your store',
        );
      throw new ConflictException('This email is already registered');
    }

    const token = uuidv4();
    const invitePayload = {
      email: dto.email,
      tenantId: existingTenant.id,
      tenantName: existingTenant.name,
      permissions: {
        canManageProducts: dto.canManageProducts ?? true,
        canManageOrders: dto.canManageOrders ?? true,
        canManageCustomers: dto.canManageCustomers ?? false,
        canViewAnalytics: dto.canViewAnalytics ?? false,
        canManageStaff: dto.canManageStaff ?? false,
      },
      invitedById: req.user.id,
      createdAt: new Date().toISOString(),
    };

    // Store invite for 48 hours
    await this.redis.set(CacheKey.staffInvite(token), invitePayload, 48 * 3600);

    await this.emailService.sendStaffInviteEmail({
      to: dto.email,
      tenantName: existingTenant.name,
      inviteToken: token,
    });

    return { message: 'Invitation sent successfully' };
  }

  async acceptInvite(dto: backendDtos.AcceptInviteDto): Promise<TenantStaff> {
    const invite = await this.redis.get<{
      email: string;
      tenantId: string;
      tenantName: string;
      permissions: {
        canManageProducts: boolean;
        canManageOrders: boolean;
        canManageCustomers: boolean;
        canViewAnalytics: boolean;
        canManageStaff: boolean;
      };
      invitedById: string;
    }>(CacheKey.staffInvite(dto.token));
    
    if (!invite) throw new GoneException('Invite link is invalid or has expired');

    let user = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });

    let tempPassword: string | null = null;
    
    if (!user) {
      tempPassword = dto.password || uuidv4();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email: invite.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          password: hashedPassword,
          role: 'TENANT_STAFF',
          isVerified: true,
          verifiedAt:new Date()
        },
      });
    } else {
      const alreadyStaff = await this.prisma.tenantStaff.findFirst({
        where: { userId: user.id, tenantId: invite.tenantId },
      });
      if (alreadyStaff)
        throw new ConflictException(
          'You are already a staff member of this store',
        );
    }

    const newStaff = await this.prisma.tenantStaff.create({
      data: {
        tenantId: invite.tenantId,
        userId: user.id,
        ...invite.permissions,
      },
      include:{
        user:true
      }
    });

    await this.redis.del(CacheKey.staffInvite(dto.token));
    await this.redis.invalidateByPrefix(CacheKey.staffPrefix(invite.tenantId));
    
    if (tempPassword) {
      await this.emailService.sendStaffWelcomeEmail({
        to: invite.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        tempPassword,
      });
    }
    
    return newStaff;
  }

  async getStaffActivity(req: any, staffId: string) {
    const existingTenant = await this.getTenant(req);

    const staff = await this.prisma.tenantStaff.findUnique({
      where: { id: staffId, tenantId: existingTenant.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!staff) throw new NotFoundException('Staff member not found');

    return {
      staffId: staff.id,
      tenantId: staff.tenantId,
      joinedAt: staff.createdAt,
      lastUpdatedAt: staff.updatedAt,
      lastLoginAt: staff.user.lastLoginAt ?? null,
      user: staff.user,
      permissions: {
        canManageProducts: staff.canManageProducts,
        canManageOrders: staff.canManageOrders,
        canManageCustomers: staff.canManageCustomers,
        canViewAnalytics: staff.canViewAnalytics,
        canManageStaff: staff.canManageStaff,
      },
    };
  }

  async deleteStaffMember(req: any, staffId: string): Promise<void> {
    const existingTenant = await this.getTenant(req);
    const existingStaff = await this.getStaffById(req, staffId);

    await this.prisma.$transaction([
      this.prisma.tenantStaff.delete({
        where: { id: existingStaff.id },
      }),
      this.prisma.user.delete({
        where: { id: existingStaff.userId },
      }),
    ]);

    await this.redis.invalidateByPrefix(
      CacheKey.staffPrefix(existingTenant.id)
    );
  }
  async updateStaffPermission(
    req: any,
    id: string,
    dto: backendDtos.UpdateTenantStaffPermission,
  ): Promise<TenantStaff> {
    const existingTenant = await this.getTenant(req);
    const existingStaff = await this.getStaffById(req, id);

    const updatedStaff = await this.prisma.tenantStaff.update({
      where: { id: existingStaff.id },
      data: {
        canManageCustomers: dto.canManageCustomers,
        canManageProducts: dto.canManageProducts,
        canManageOrders: dto.canManageOrders,
        canManageStaff: dto.canManageStaff,
        canViewAnalytics: dto.canViewAnalytics,
      },
      include:{
        user:true
      }
    });

    await this.redis.invalidateByPrefix(
      CacheKey.staffPrefix(existingTenant.id),
    );

    return updatedStaff;
  }
}
