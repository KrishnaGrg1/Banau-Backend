import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { backendDtos } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as Papa from 'papaparse';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomerServices {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private async getExistingTenant(req) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!existingTenant) throw new ConflictException('Tenant not exists');
    return existingTenant;
  }

  async listAllCustomers(req, paginationDto: backendDtos.PaginationDto) {
    const { limit = 10, offset = 0, role } = paginationDto;
    const existingTenant = await this.getExistingTenant(req);
    const [exsitingCustomers, total] = await Promise.all([
      await this.prisma.customer.findMany({
        where: {
          tenantId: String(existingTenant.id),
        },
        include: {
          _count: {
            select: { orders: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.customer.count({
        where: {
          tenantId: String(existingTenant.id),
        },
      }),
    ]);
    // Map all customers to DTOs
    const customersDto = exsitingCustomers.map((customer) =>
      this.customerToDto(customer),
    );
    return {
      customers: customersDto,
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }

  async getCustomerById(req, customerId: string) {
    const existingTenant = await this.getExistingTenant(req);
    const existingCustomer = await this.prisma.customer.findUnique({
      where: {
        id: String(customerId),
        tenantId: String(existingTenant.id),
      },
    });
    return existingCustomer;
  }

  async getCustomerOrders(
    req,
    customerId,
    paginationDto: backendDtos.PaginationDto,
  ) {
    const tenant = await this.getExistingTenant(req);
    const { limit = 10, offset = 0, role } = paginationDto;

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: String(customerId),
        tenantId: String(tenant.id),
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },

        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({
        where: { customerId },
      }),
    ]);
    return {
      orders: orders.map(this.orderToDto),
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }

  async createCustomer(req, dto: backendDtos.CreateCustomerDto) {
    const tenant = await this.getExistingTenant(req);

    const existingCustomer = await this.prisma.customer.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: dto.email,
        },
      },
    });
    if (existingCustomer)
      throw new ConflictException('Customer with these email already exists');

    const customer = await this.prisma.customer.create({
      data: {
        ...dto,
        tenantId: tenant.id,
      },
    });

    return customer;
  }
  async updateCustomer(
    req: any,
    id: string,
    dto: backendDtos.UpdateCustomerDto,
  ) {
    const tenant = await this.getExistingTenant(req);

    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email !== customer.email) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          email: dto.email,
          tenantId: tenant.id,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: dto,
    });

    return updated;
  }
  async deleteCustomer(req: any, id: string) {
    const tenant = await this.getExistingTenant(req);

    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        orders: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if customer has orders
    if (customer.orders.length > 0) {
      throw new ConflictException(
        'Cannot delete customer with existing orders. Consider archiving instead.',
      );
    }

    await this.prisma.customer.delete({
      where: { id },
    });
  }
  async exportCustomers(req, format: 'csv' | 'xlsx') {
    const existingTenant = await this.getExistingTenant(req);
    const existingCustomer = await this.prisma.customer.findMany({
      where: {
        tenantId: String(existingTenant.id),
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const exportData = existingCustomer.map((customer) => ({
      'Customer ID': customer.id,
      'First Name': customer.firstName,
      'Last Name': customer.lastName,
      Email: customer.email,
      Phone: customer.phone || '',
      'Total Orders': customer._count.orders,
      'Total Spent': customer.totalSpent.toString(),
      'Last Order': customer.lastOrderAt?.toISOString() || '',
      'Created At': customer.createdAt.toISOString(),
    }));

    if (format === 'csv') {
      const csv = Papa.unparse(exportData);
      return {
        buffer: Buffer.from(csv),
        filename: `products-${Date.now()}.csv`,
        mimeType: 'text/csv',
      };
    } else {
      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Orders');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return {
        buffer: Buffer.from(buffer),
        filename: `orders-${Date.now()}.xlsx`,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
  }

  async getMyProfile(req: any) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    return customer;
  }
  async updateMyProfile(req: any, dto: backendDtos.UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email !== customer.email) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          email: dto.email,
          tenantId: customer.tenantId,
          id: { not: customer.id },
        },
      });

      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: dto,
    });

    return updated;
  }
  async getMyOrders(req: any, paginationDto: backendDtos.PaginationDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const { limit = 10, offset = 0, role } = paginationDto;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: customer.id },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.order.count({
        where: { customerId: customer.id },
      }),
    ]);

    return {
      orders: orders.map(this.orderToDto),
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }

  private async generateToken(user: any) {
    const payload = { sub: user.id, role: user.role, isActive: user.isActive };

    // Clean expired tokens
    await this.prisma.token.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Same JWT structure as auth
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '7m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.token.create({
      data: {
        userId: String(user.id),
        token: hashedRefreshToken,
        type: 'REFRESH',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
  async registerCustomer(dto: backendDtos.RegisterCustomerDto, res: any) {
    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain },
    });

    if (!tenant || !tenant.published) {
      throw new NotFoundException('Store not found');
    }

    // Check if email exists in this store
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        email: dto.email,
        tenantId: tenant.id,
      },
    });

    if (existingCustomer) {
      throw new ConflictException('Email already registered in this store');
    }

    // Check if user email exists globally
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password (same as auth)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'CUSTOMER',
        isVerified: true, // Auto-verify customers (or send email if needed)
        verifiedAt: new Date(),
      },
    });

    // Create customer profile
    const customer = await this.prisma.customer.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        tenantId: tenant.id,
        userId: user.id,
      },
    });

    // Generate tokens (same as auth)
    const { accessToken, refreshToken } = await this.generateToken(user);

    // Set cookies (same as auth)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 7 * 60 * 1000, // 7 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    Logger.log('Customer registered and logged in');

    return {
      user: userWithoutPassword,
      customer: this.customerToDto(customer),
      accessToken,
      refreshToken,
    };
  }

  async loginCustomer(dto: backendDtos.LoginCustomerDto, res: any) {
    // Find user
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!existingUser || existingUser.role !== 'CUSTOMER') {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify email (same as auth)
    if (!existingUser.isVerified) {
      throw new UnauthorizedException('Please verify your email');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } =
      await this.generateToken(existingUser);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 7 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: { lastLoginAt: new Date() },
    });

    // Get customer profile
    const customer = await this.prisma.customer.findUnique({
      where: { userId: existingUser.id },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = existingUser;

    Logger.log('Customer logged in');
    Logger.log('accessToken', accessToken);
    Logger.log('refreshToken', refreshToken);

    return {
      user: userWithoutPassword,
      customer: customer ? this.customerToDto(customer) : null,
      accessToken,
      refreshToken,
    };
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private async getTenant(req: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { ownerId: String(req.user.id) },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  private customerToDto(customer: any) {
    return {
      ...customer,
      totalSpent: customer.totalSpent.toString(),
      averageSpent: customer.averageSpent?.toString(),
    };
  }
  private orderToDto(order: any) {
    return {
      ...order,
      total: order.total.toString(),
      subtotal: order.subtotal?.toString(),
      tax: order.tax?.toString(),
      shipping: order.shipping?.toString(),
      discount: order.discount?.toString(),
      items: order.items?.map((item: any) => ({
        ...item,
        price: item.price.toString(),
      })),
    };
  }
}
