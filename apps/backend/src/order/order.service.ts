import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { backendDtos } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as Papa from 'papaparse';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/email/email.service';

// Reused include shape for orders that need full relations
const ORDER_FULL_INCLUDE = {
  customer: true,
  items: { include: { product: true, variant: true } },
} as const;

@Injectable()
export class OrderServices {
  private stripe: Stripe;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_API_KEY');
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (!apiKey) {
      console.warn('⚠️  STRIPE_API_KEY not set — payment features disabled');
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(apiKey);
    }
  }

  // ─── Private guards ──────────────────────────────────────────────────────

  private ensureStripe() {
    if (!this.stripe)
      throw new Error(
        'Stripe is not configured. Add STRIPE_API_KEY to your environment variables.',
      );
  }

  // ─── Private tenant helpers ──────────────────────────────────────────────

  private async getTenantByOwner(req: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { ownerId: String(req.user.id) },
    });
    if (!tenant) throw new ConflictException('No tenant found for this user');
    return tenant;
  }

  private async getTenantById(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Store not found');
    return tenant;
  }

  // ─── Private user / customer helpers ─────────────────────────────────────

  /**
   * Finds an existing user by email or creates a new CUSTOMER user.
   * Returns the userId, whether it was freshly created, and the plain-text
   * temp password (only present on first creation so it can be emailed once).
   */
  private async getOrCreateUser(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<{ userId: string; isNew: boolean; tempPassword?: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return { userId: existing.id, isNew: false };

    const tempPassword = uuidv4().replace(/-/g, '').slice(0, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(tempPassword, 10),
        firstName,
        lastName,
        role: 'CUSTOMER',
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
    return { userId: user.id, isNew: true, tempPassword };
  }

  /**
   * Finds an existing customer for this tenant+email, or creates one
   * (along with a user account if needed).
   */
  private async getOrCreateCustomer(
    tenantId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
    },
  ) {
    const existing = await this.prisma.customer.findFirst({
      where: { email: data.email, tenantId },
    });
    if (existing) return { customer: existing, isNewUser: false };

    const { userId, isNew, tempPassword } = await this.getOrCreateUser(
      data.email,
      data.firstName,
      data.lastName,
    );

    const customer = await this.prisma.customer.create({
      data: { ...data, tenantId, userId },
    });

    return { customer, isNewUser: isNew, tempPassword };
  }

  // ─── Private customer stats helper ───────────────────────────────────────

  /**
   * Recalculates and persists totalSpent, ordersCount, lastOrderAt, and
   * averageSpent for the given customer based on their actual order history.
   * Call this after every order creation or cancellation.
   */
  private async updateCustomerStats(customerId: string) {
    const agg = await this.prisma.order.aggregate({
      where: { customerId },
      _sum: { total: true },
      _count: { id: true },
      _max: { createdAt: true },
    });

    const totalSpent = agg._sum.total ?? 0;
    const ordersCount = agg._count.id;
    const lastOrderAt = agg._max.createdAt;
    const averageSpent = ordersCount > 0 ? Number(totalSpent) / ordersCount : 0;

    await this.prisma.customer.update({
      where: { id: customerId },
      data: { totalSpent, ordersCount, lastOrderAt, averageSpent },
    });
  }

  // ─── Private inventory helper ─────────────────────────────────────────────

  private async deductInventory(
    items: Array<{ productId: string; variantId?: string; quantity: number }>,
  ) {
    await Promise.all(
      items.map((item) =>
        item.variantId
          ? this.prisma.productVariant.update({
              where: { id: item.variantId },
              data: { quantity: { decrement: item.quantity } },
            })
          : this.prisma.product.update({
              where: { id: item.productId },
              data: { quantity: { decrement: item.quantity } },
            }),
      ),
    );
  }

  // ─── Private email helper ─────────────────────────────────────────────────

  private sendOrderEmails(params: {
    order: any;
    customer: any;
    tenant: any;
    subdomain: string;
    isNewUser: boolean;
    tempPassword?: string;
  }) {
    const { order, customer, tenant, subdomain, isNewUser, tempPassword } =
      params;

    this.emailService
      .sendOrderConfirmationToCustomer({
        order,
        customer,
        storeName: tenant.name,
        subdomain,
        isNewUser,
        tempPassword,
      })
      .catch((e) =>
        console.error('[Email] Customer order confirmation failed:', e.message),
      );

    this.emailService
      .sendNewOrderNotificationToOwner({
        order,
        ownerEmail: tenant.email,
        storeName: tenant.name,
      })
      .catch((e) =>
        console.error('[Email] Owner order notification failed:', e.message),
      );
  }

  // ─── Private DTO serialiser ───────────────────────────────────────────────

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

  // ─── Private pagination meta helper ──────────────────────────────────────

  private paginationMeta(total: number, limit: number, offset: number) {
    return {
      total,
      limit,
      offset,
      hasNextPage: offset + limit < total,
      hasPreviousPage: offset > 0,
    };
  }

  // ─── Private Stripe metadata parser ──────────────────────────────────────

  private parseCheckoutMetadata(session: Stripe.Checkout.Session) {
    const {
      tenantId,
      subdomain,
      customerData: customerStr,
      items: itemsStr,
    } = session.metadata ?? {};

    if (!tenantId || !customerStr || !itemsStr)
      throw new Error('Missing required metadata in checkout session');

    return {
      tenantId,
      subdomain: subdomain ?? '',
      customerData: JSON.parse(customerStr) as {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        shippingAddress?: string;
        shippingCity?: string;
        shippingState?: string;
        shippingDistrict?: string;
        shippingCountry?: string;
        customerNotes?: string;
      },
      items: JSON.parse(itemsStr) as Array<{
        productId: string;
        variantId?: string;
        quantity: number;
        price: number;
        productName: string;
        variantName?: string;
      }>,
    };
  }

  // ==========================================
  // ADMIN / TENANT METHODS
  // ==========================================

  async getAllOrder(paginationDto: backendDtos.PaginationDto, req: any) {
    const { limit = 10, offset = 0 } = paginationDto;
    const tenant = await this.getTenantByOwner(req);

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { tenantId: tenant.id },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: ORDER_FULL_INCLUDE,
      }),
      this.prisma.order.count({ where: { tenantId: tenant.id } }),
    ]);

    return {
      orders: orders.map((o) => this.orderToDto(o)),
      meta: this.paginationMeta(total, limit, offset),
    };
  }

  async getOrderById(orderId: string, req: any) {
    const tenant = await this.getTenantByOwner(req);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, tenantId: tenant.id },
      include: ORDER_FULL_INCLUDE,
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(
    req: any,
    orderId: string,
    dto: backendDtos.updateOrderStatus,
  ) {
    const existing = await this.getOrderById(orderId, req);
    return this.prisma.order.update({
      where: { id: existing.id },
      data: { status: dto.status },
      include: ORDER_FULL_INCLUDE,
    });
  }

  async addTracking(req: any, id: string, dto: backendDtos.addTrackingDto) {
    const existing = await this.getOrderById(id, req);
    const updated = await this.prisma.order.update({
      where: { id: existing.id },
      data: {
        trackingCarrier: dto.trackingCarrier,
        trackingNumber: dto.trackingNumber,
        status: 'SHIPPED',
      },
      include: ORDER_FULL_INCLUDE,
    });
    return this.orderToDto(updated);
  }

  async refundOrder(req: any, id: string, dto: backendDtos.refundDto) {
    this.ensureStripe();
    const existing = await this.getOrderById(id, req);
    if (!existing.paymentIntentId)
      throw new ConflictException('No payment to refund');

    return this.prisma.$transaction(async (tx) => {
      await this.stripe.refunds.create({
        payment_intent: existing.paymentIntentId ?? undefined,
        amount: dto.amount ? Math.round(dto.amount * 100) : undefined,
        reason:
          (dto.reason as Stripe.RefundCreateParams.Reason) ||
          'requested_by_customer',
      });

      const updated = await tx.order.update({
        where: { id },
        data: { status: 'REFUNDED' },
        include: ORDER_FULL_INCLUDE,
      });

      return this.orderToDto(updated);
    });
  }

  async deleteOrder(orderId: string, req: any) {
    const tenant = await this.getTenantByOwner(req);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId, tenantId: tenant.id },
    });
    if (!order) throw new NotFoundException('Order not found');

    const DELETABLE_STATUSES = ['PENDING', 'CANCELLED', 'REFUNDED', 'FAILED'];
    if (!DELETABLE_STATUSES.includes(order.status)) {
      throw new ConflictException(
        `Cannot delete an order with status "${order.status}". ` +
          `Only ${DELETABLE_STATUSES.join(', ')} orders can be deleted.`,
      );
    }

    await this.prisma.order.delete({ where: { id: orderId } });
    await this.updateCustomerStats(order.customerId);

    return { deleted: true, orderId };
  }

  async exportOrders(req: any, format: 'csv' | 'xlsx') {
    const tenant = await this.getTenantByOwner(req);
    const orders = await this.prisma.order.findMany({
      where: { tenantId: tenant.id },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = orders.map((o) => ({
      'Order ID': o.id,
      'Customer Name': `${o.customer.firstName} ${o.customer.lastName}`,
      'Customer Email': o.customer.email,
      Status: o.status,
      Subtotal: o.subtotal.toString(),
      Tax: o.tax?.toString() ?? '',
      Discount: o.discount?.toString() ?? '',
      Total: o.total.toString(),
      'Payment Method': o.paymentMethod,
      'Shipping Name': `${o.ShippingfirstName} ${o.ShippinglastName}`,
      'Shipping Email': o.ShippingEmail ?? '',
      'Shipping Phone': o.ShippingContactNumber ?? '',
      'Shipping Address': o.ShippingAddress ?? '',
      'Shipping City': o.ShippingCity ?? '',
      'Shipping District': o.ShippingDistrict ?? '',
      'Shipping State': o.ShippingState ?? '',
      'Shipping Country': o.ShippingCountry ?? '',
      'Tracking Number': o.trackingNumber ?? '',
      'Created At': o.createdAt.toISOString(),
    }));

    if (format === 'csv') {
      return {
        buffer: Buffer.from(Papa.unparse(rows)),
        filename: `orders-${Date.now()}.csv`,
        mimeType: 'text/csv',
      };
    }

    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Orders');
    return {
      buffer: Buffer.from(xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })),
      filename: `orders-${Date.now()}.xlsx`,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  // ==========================================
  // CUSTOMER (STOREFRONT) METHODS
  // ==========================================

  async getCustomerOrders(req: any, paginationDto: backendDtos.PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const customer = await this.prisma.customer.findUnique({
      where: { userId: req.user.id },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: customer.id },
        include: { items: { include: { product: true, variant: true } } },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { customerId: customer.id } }),
    ]);

    return {
      orders: orders.map((o) => this.orderToDto(o)),
      meta: this.paginationMeta(total, limit, offset),
    };
  }

  async getCustomerOrder(req: any, id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId: req.user.id },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id, customerId: customer.id },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.orderToDto(order);
  }

  // ==========================================
  // PUBLIC CHECKOUT METHODS
  // ==========================================

  async createPaymentIntent(dto: backendDtos.CreatePaymentIntentDto) {
    this.ensureStripe();
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain },
    });
    if (!tenant) throw new NotFoundException('Store not found');

    let total = 0;
    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenantId: tenant.id },
      });
      if (!product) continue;

      const price = item.variantId
        ? ((
            await this.prisma.productVariant.findUnique({
              where: { id: item.variantId },
            })
          )?.price ?? product.price)
        : product.price;

      total += Number(price) * item.quantity;
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'npr',
      metadata: { tenantId: tenant.id, subdomain: tenant.subdomain },
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: total,
    };
  }

  async confirmOrder(dto: backendDtos.ConfirmOrderDto) {
    this.ensureStripe();

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      dto.paymentIntentId,
    );
    if (paymentIntent.status !== 'succeeded')
      throw new ConflictException('Payment not completed');

    const tenantId = paymentIntent.metadata.tenantId;
    const subdomain = paymentIntent.metadata.subdomain;
    const tenant = await this.getTenantById(tenantId);

    const { customer, isNewUser, tempPassword } =
      await this.getOrCreateCustomer(tenantId, {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      });

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
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName,
            variantName: item.variantName ?? undefined,
          })),
        },
      },
      include: ORDER_FULL_INCLUDE,
    });

    await this.deductInventory(dto.items);
    await this.updateCustomerStats(customer.id);
    this.sendOrderEmails({
      order,
      customer: order.customer,
      tenant,
      subdomain,
      isNewUser,
      tempPassword,
    });

    return this.orderToDto(order);
  }

  async createCheckoutSession(dto: backendDtos.CreateCheckoutSessionDto) {
    this.ensureStripe();

    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain },
    });
    if (!tenant || !tenant.published)
      throw new NotFoundException('Store not found');

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenantId: tenant.id },
        include: { featuredImage: true },
      });
      if (!product) continue;

      const price = item.variantId
        ? ((
            await this.prisma.productVariant.findUnique({
              where: { id: item.variantId },
            })
          )?.price ?? product.price)
        : product.price;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: item.variantName || product.description || undefined,
            images: product.featuredImage ? [product.featuredImage.url] : [],
          },
          unit_amount: Math.round(Number(price) * 100),
        },
        quantity: item.quantity,
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.frontendUrl}/checkout`,
      customer_email: dto.email,
      metadata: {
        tenantId: tenant.id,
        subdomain: dto.subdomain,
        customerData: JSON.stringify({
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          shippingAddress: dto.shippingAddress,
          shippingCity: dto.shippingCity,
          shippingState: dto.shippingState,
          shippingDistrict: dto.shippingDistrict,
          shippingCountry: dto.shippingCountry,
          customerNotes: dto.customerNotes,
        }),
        items: JSON.stringify(dto.items),
      },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { tenantId, subdomain, customerData, items } =
      this.parseCheckoutMetadata(session);

    const tenant = await this.getTenantById(tenantId);

    const { customer, isNewUser, tempPassword } =
      await this.getOrCreateCustomer(tenantId, {
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
      });

    const order = await this.prisma.order.create({
      data: {
        tenantId,
        customerId: customer.id,
        status: 'PAID',
        subtotal: session.amount_subtotal! / 100,
        tax: (session.total_details?.amount_tax ?? 0) / 100,
        shipping: (session.total_details?.amount_shipping ?? 0) / 100,
        total: session.amount_total! / 100,
        paymentIntentId: session.payment_intent as string,
        paymentMethod: 'card',
        ShippingfirstName: customerData.firstName,
        ShippinglastName: customerData.lastName,
        ShippingEmail: customerData.email,
        ShippingContactNumber: customerData.phone,
        ShippingAddress: customerData.shippingAddress,
        ShippingCity: customerData.shippingCity,
        ShippingState: customerData.shippingState,
        ShippingDistrict: customerData.shippingDistrict,
        ShippingCountry: customerData.shippingCountry,
        customerNotes: customerData.customerNotes,
        paidAt: new Date(),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName,
            ...(item.variantId && { variantId: item.variantId }),
            ...(item.variantName && { variantName: item.variantName }),
          })),
        },
      },
      include: { ...ORDER_FULL_INCLUDE, items: true },
    });

    await this.deductInventory(items);
    await this.updateCustomerStats(customer.id);
    this.sendOrderEmails({
      order,
      customer,
      tenant,
      subdomain,
      isNewUser,
      tempPassword,
    });

    return order;
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    this.ensureStripe();

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret)
      throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
        // Handled via checkout.session.completed — no extra action needed
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
