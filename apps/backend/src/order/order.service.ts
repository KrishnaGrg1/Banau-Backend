import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { backendDtos } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as Papa from 'papaparse';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderServices {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_API_KEY');
    if (!apiKey) {
      throw new Error('STRIPE_API_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(apiKey!);
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
  private async getTenant(req) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!existingTenant) throw new ConflictException('User dont have tenants');
    return existingTenant;
  }
  async getAllOrder(paginationDto: backendDtos.PaginationDto, req) {
    const { limit = 10, offset = 0, role } = paginationDto;
    const existingTenant = await this.getTenant(req);

    const [existingProducts, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          tenantId: String(existingTenant.id),
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      }),
      this.prisma.order.count({
        where: {
          tenantId: String(existingTenant.id),
        },
      }),
    ]);
    return {
      existingProducts: await Promise.all(
        existingProducts.map(async (product) => {
          return this.orderToDto({ ...product });
        }),
      ),
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }
  async exportOrders(req, format: 'csv' | 'xlsx') {
    const existingTenant = await this.getTenant(req);
    const existingOrders = await this.prisma.order.findMany({
      where: {
        tenantId: String(existingTenant.id),
      },
      include: {
        customer: true,
      },
    });
    const exportData = existingOrders.map((o) => ({
      'Order Id': o.id,
      'Customer Name': `${o.customer.firstName}+ ${o.customer.lastName}`,
      'Customer Email': o.customer.email,
      Status: o.status,
      SubTotal: o.subtotal.toString(),
      Tax: o.tax?.toString(),
      Discount: o.tax?.toString(),
      Total: o.total.toString(),
      'Payment Method': o.paymentMethod,
      'Shipping Username': `${o.ShippingfirstName} ${o.ShippinglastName}`,
      'Shipping Email': o.ShippingEmail ?? '',
      'Shipping Contact Number': o.ShippingContactNumber ?? '',
      'Shipping Country': o.ShippingCountry ?? '',
      'Shipping State': o.ShippingState ?? '',
      'Shipping District': o.ShippingDistrict ?? '',
      'Shipping City': o.ShippingCity ?? '',
      'Shipping Address': o.ShippingAddress ?? '',

      'Created At': o.createdAt.toISOString(),
      'Tracking Number': o.trackingNumber || '',
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

  async getOrderById(orderId: string, req) {
    const existingTenant = await this.getTenant(req);
    const existingOrder = await this.prisma.order.findUnique({
      where: {
        id: orderId,
        tenantId: String(existingTenant.id),
      },
    });
    if (!existingOrder) throw new ConflictException('Order not found');
    return existingOrder;
  }

  async updateOrderStatus(
    req,
    orderId: string,
    dto: backendDtos.updateOrderStatus,
  ) {
    const existingOrder = await this.getOrderById(orderId, req);
    return this.prisma.order.update({
      where: {
        id: String(existingOrder.id),
      },
      data: {
        status: dto.status,
      },
      include: {
        customer: true,
        items: {
          include: { product: true, variant: true },
        },
      },
    });
  }

  async addTracking(req, id: string, dto: backendDtos.addTrackingDto) {
    const existingOrder = await this.getOrderById(id, req);
    return await this.orderToDto(
      await this.prisma.order.update({
        where: {
          id: String(existingOrder.id),
        },
        data: {
          trackingCarrier: dto.trackingCarrier,
          trackingNumber: dto.trackingNumber,
          status: 'SHIPPED',
        },
        include: {
          customer: true,
          items: { include: { product: true, variant: true } },
        },
      }),
    );
  }
  async refundOrder(req, id: string, dto: backendDtos.refundDto) {
    const existingOrder = await this.getOrderById(id, req);
    if (!existingOrder.paymentIntentId)
      throw new ConflictException('No payment to refund');
    return await this.prisma.$transaction(async (tx) => {
      await this.stripe.refunds.create({
        payment_intent: existingOrder.paymentIntentId ?? undefined,
        amount: dto.amount ? Math.round(dto.amount * 100) : undefined,
        reason:
          (dto.reason as Stripe.RefundCreateParams.Reason) ||
          'requested_by_customer',
      });

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'REFUNDED' },
        include: {
          customer: true,
          items: { include: { product: true, variant: true } },
        },
      });

      return this.orderToDto(updatedOrder);
    });
  }
  async getCustomerOrders(req,paginationDto:backendDtos.PaginationDto){
    const { limit = 10, offset = 0, role } = paginationDto;
    const customer = await this.prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }
    const [orders,total]=await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: customer.id },
        include: {
          items: {
            include: { product: true, variant: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({
        where: { customerId: customer.id },
      }),
    ])
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
  async getCustomerOrder(req: any, id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const order = await this.prisma.order.findFirst({
      where: { id, customerId: customer.id },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.orderToDto(order);
  }

  // ==========================================
  // PUBLIC METHODS (Checkout)
  // ==========================================

  async createPaymentIntent(dto: backendDtos.CreatePaymentIntentDto) {
    // Verify tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Store not found');
    }

    // Calculate total
    let total = 0;
    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenantId: tenant.id },
      });

      if (!product) continue;

      const price = item.variantId
        ? (await this.prisma.productVariant.findUnique({
            where: { id: item.variantId },
          }))?.price || product.price
        : product.price;

      total += Number(price) * item.quantity;
    }

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents
      currency: 'usd',
      metadata: {
        tenantId: tenant.id,
        subdomain: tenant.subdomain,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: total,
    };
  }
 

  async confirmOrder(dto: backendDtos.ConfirmOrderDto) {
    // Verify payment intent
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      dto.paymentIntentId,
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new ConflictException('Payment not completed');
    }

    const tenantId = paymentIntent.metadata.tenantId;

    // Create or get customer
    let customer = await this.prisma.customer.findFirst({
      where: {
        email: dto.email,
        tenantId,
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          tenantId,
        },
      });
    }

    // Create order
    const order = await this.prisma.order.create({
      data: {
      tenantId,
      customerId: customer.id,
      status: 'PAID',
      subtotal: dto.subtotal ?? paymentIntent.amount / 100,
      tax: dto.tax ?? 0,
      shipping: dto.shipping ?? 0,
      discount: dto.discount ?? 0,
      total: dto.total ?? paymentIntent.amount / 100,
      paymentIntentId: dto.paymentIntentId,
      paymentMethod: dto.paymentMethod ?? 'card',
      ShippingfirstName: dto.firstName,
      ShippinglastName: dto.lastName,
      ShippingEmail: dto.email,
      ShippingContactNumber: dto.phone,
      ShippingAddress: dto.shippingAddress,
      ShippingCity: dto.shippingCity,
      ShippingState: dto.shippingState,
      ShippingDistrict: dto.shippingDistrict,
      ShippingCountry: dto.shippingCountry,
      notes: dto.notes,
      customerNotes: dto.customerNotes,
      paidAt: new Date(),
      items: {
        create: dto.items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        productName: item.productName,
        variantName: item.variantName,
        })),
      },
      },
      include: {
      items: { include: { product: true, variant: true } },
      customer: true,
      },
    });

    // Deduct inventory
    for (const item of dto.items) {
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { decrement: item.quantity } },
        });
      } else {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    return this.orderToDto(order);
  }

  
}
