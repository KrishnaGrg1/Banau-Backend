import { ConflictException, Injectable } from '@nestjs/common';
import {
  OrderStatus,
  Plan,
  TenantStatus,
  UserRole,
} from '@repo/db/dist/generated/prisma/enums';
import { backendDtos } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminServices {
  constructor(private prisma: PrismaService) {}

  private readonly paidOrderStatuses = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  private toNumber(value: unknown) {
    return Number(value ?? 0);
  }

  private getRangeStart(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private growthPercent(current: number, previous: number) {
    if (!previous) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  async getAdminOverview() {
    const [totalUsers, totalTenants, activeTenants, totalOrders, totalRevenue] =
      await Promise.all([
        this.prisma.user.count({ where: { role: { not: UserRole.SUPER_ADMIN } } }),
        this.prisma.tenant.count(),
        this.prisma.tenant.count({ where: { status: TenantStatus.ACTIVE } }),
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          where: { status: { in: this.paidOrderStatuses } },
          _sum: { total: true },
        }),
      ]);

    return {
      totalUsers,
      totalTenants,
      activeTenants,
      totalOrders,
      totalRevenue: this.toNumber(totalRevenue._sum.total),
    };
  }

  async getAnalyticsOverview() {
    const userByRole = await this.prisma.user.groupBy({
      by: ['role'],
      where: { role: { not: UserRole.SUPER_ADMIN } },
      _count: { _all: true },
    });

    const tenantsByStatus = await this.prisma.tenant.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const recentOrders = await this.prisma.order.findMany({
      where: {
        status: { in: this.paidOrderStatuses },
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const monthlyRevenueMap = new Map<string, number>();
    for (const order of recentOrders) {
      const month = order.createdAt.toISOString().slice(0, 7);
      monthlyRevenueMap.set(
        month,
        (monthlyRevenueMap.get(month) ?? 0) + this.toNumber(order.total),
      );
    }

    return {
      userByRole,
      tenantsByStatus,
      ordersByStatus,
      monthlyRevenue: Array.from(monthlyRevenueMap.entries()).map(
        ([month, total]) => ({ month, total }),
      ),
    };
  }

  async getGrowthMetrics() {
    const now = new Date();
    const last30Days = this.getRangeStart(30);
    const last60Days = this.getRangeStart(60);

    const [
      usersLast30,
      usersPrevious30,
      tenantsLast30,
      tenantsPrevious30,
      customersLast30,
      customersPrevious30,
      ordersLast30,
      ordersPrevious30,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: { not: UserRole.SUPER_ADMIN },
          createdAt: { gte: last30Days },
        },
      }),
      this.prisma.user.count({
        where: {
          role: { not: UserRole.SUPER_ADMIN },
          createdAt: { gte: last60Days, lt: last30Days },
        },
      }),
      this.prisma.tenant.count({ where: { createdAt: { gte: last30Days } } }),
      this.prisma.tenant.count({
        where: { createdAt: { gte: last60Days, lt: last30Days } },
      }),
      this.prisma.customer.count({ where: { createdAt: { gte: last30Days } } }),
      this.prisma.customer.count({
        where: { createdAt: { gte: last60Days, lt: last30Days } },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: last30Days } } }),
      this.prisma.order.count({
        where: { createdAt: { gte: last60Days, lt: last30Days } },
      }),
    ]);

    return {
      period: {
        from: last30Days.toISOString(),
        to: now.toISOString(),
      },
      users: {
        current: usersLast30,
        previous: usersPrevious30,
        growthPercent: this.growthPercent(usersLast30, usersPrevious30),
      },
      tenants: {
        current: tenantsLast30,
        previous: tenantsPrevious30,
        growthPercent: this.growthPercent(tenantsLast30, tenantsPrevious30),
      },
      customers: {
        current: customersLast30,
        previous: customersPrevious30,
        growthPercent: this.growthPercent(customersLast30, customersPrevious30),
      },
      orders: {
        current: ordersLast30,
        previous: ordersPrevious30,
        growthPercent: this.growthPercent(ordersLast30, ordersPrevious30),
      },
    };
  }

  async getRevenueMetrics() {
    const now = new Date();
    const start1Day = this.getRangeStart(1);
    const start7Days = this.getRangeStart(7);
    const start30Days = this.getRangeStart(30);

    const [todayRevenue, sevenDayRevenue, monthRevenue, monthPaidOrders] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: {
            status: { in: this.paidOrderStatuses },
            createdAt: { gte: start1Day },
          },
          _sum: { total: true },
        }),
        this.prisma.order.aggregate({
          where: {
            status: { in: this.paidOrderStatuses },
            createdAt: { gte: start7Days },
          },
          _sum: { total: true },
        }),
        this.prisma.order.aggregate({
          where: {
            status: { in: this.paidOrderStatuses },
            createdAt: { gte: start30Days },
          },
          _sum: { total: true },
        }),
        this.prisma.order.count({
          where: {
            status: { in: this.paidOrderStatuses },
            createdAt: { gte: start30Days },
          },
        }),
      ]);

    const total30Days = this.toNumber(monthRevenue._sum.total);

    return {
      period: {
        from: start30Days.toISOString(),
        to: now.toISOString(),
      },
      revenueToday: this.toNumber(todayRevenue._sum.total),
      revenue7Days: this.toNumber(sevenDayRevenue._sum.total),
      revenue30Days: total30Days,
      paidOrders30Days: monthPaidOrders,
      averageOrderValue30Days: monthPaidOrders
        ? Number((total30Days / monthPaidOrders).toFixed(2))
        : 0,
    };
  }

  async getUserRoles() {
    return {
      roles: Object.values(UserRole),
    };
  }

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

  async getFeatureFlags() {
    return {
      features: [
        { key: 'tenant-signup', enabled: true },
        { key: 'public-store', enabled: true },
        { key: 'advanced-analytics', enabled: true },
        { key: 'multi-currency', enabled: false },
        { key: 'beta-reports', enabled: false },
      ],
    };
  }

  async getPlanManagement() {
    const planCounts = await this.prisma.tenant.groupBy({
      by: ['plan'],
      _count: { _all: true },
    });

    return {
      availablePlans: Object.values(Plan),
      tenantsByPlan: planCounts,
    };
  }

  async getSystemSettings() {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      uptimeInSeconds: Math.floor(process.uptime()),
      serverTime: new Date().toISOString(),
      apiVersion: 'v1',
    };
  }
}
