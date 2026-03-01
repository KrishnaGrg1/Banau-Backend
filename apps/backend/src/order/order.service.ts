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

@Injectable()
export class OrderServices {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_API_KEY');
    if (!apiKey) {
      console.warn('⚠️  STRIPE_API_KEY is not defined - payment features will not work');
      console.warn('⚠️  Add STRIPE_API_KEY to your .env file to enable payments');
      // Create a dummy stripe instance to prevent crashes
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(apiKey);
    }
  }

  private ensureStripe() {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_API_KEY to your environment variables.');
    }
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
      orders: await Promise.all(
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
      include:{
        items:true
      }
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
    this.ensureStripe();
    
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
  async getCustomerOrders(req, paginationDto: backendDtos.PaginationDto) {
    const { limit = 10, offset = 0, role } = paginationDto;
    const customer = await this.prisma.customer.findUnique({
      where: { userId: req.user.id },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }
    const [orders, total] = await Promise.all([
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
    this.ensureStripe();
    
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
        ? (
            await this.prisma.productVariant.findUnique({
              where: { id: item.variantId },
            })
          )?.price || product.price
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
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: total,
    };
  }

  async confirmOrder(dto: backendDtos.ConfirmOrderDto) {
    this.ensureStripe();
    
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

  async createCheckoutSession(dto: backendDtos.CreateCheckoutSessionDto) {
    this.ensureStripe();
    
    console.log('[CreateSession] Received DTO with', dto.items.length, 'items');
    console.log('[CreateSession] DTO items:', JSON.stringify(dto.items, null, 2));
    
    // Verify tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain },
    });

    if (!tenant || !tenant.published) {
      throw new NotFoundException('Store not found');
    }

    // Prepare line items
    const lineItems: any[] = [];
    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, tenantId: tenant.id },
        include: {
          featuredImage: true,
        },
      });

      if (!product) continue;

      const price = item.variantId
        ? (
            await this.prisma.productVariant.findUnique({
              where: { id: item.variantId },
            })
          )?.price || product.price
        : product.price;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: item.variantName || product.description,
            images: product.featuredImage ? [product.featuredImage.url] : [],
          },
          unit_amount: Math.round(Number(price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      });
    }

    // Get frontend URL
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',

      // Success/Cancel URLs
      success_url: `${frontendUrl}/s/${dto.subdomain}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/s/${dto.subdomain}/checkout`,

      // Customer info
      customer_email: dto.email,

      // Metadata (important for webhook!)
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
    
    console.log('[CreateSession] Stored items in metadata:', JSON.stringify(dto.items));
    console.log('[CreateSession] Session created:', session.id);

    return {
      sessionId: session.id,
      url: session.url, // Redirect user here
    };
  }
  // apps/api/src/order/order.service.ts

  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    try {
      console.log('[CheckoutCompleted] Processing session:', session.id);
      
      const metadata = session.metadata || {};
      const tenantId = metadata.tenantId;
      const subdomain = metadata.subdomain;
      const customerDataStr = metadata.customerData;
      const itemsStr = metadata.items;

      console.log('[CheckoutCompleted] Metadata:', {
        tenantId,
        subdomain,
        hasCustomerData: !!customerDataStr,
        hasItems: !!itemsStr,
      });
      
      console.log('[CheckoutCompleted] Raw items string:', itemsStr);

      if (!tenantId || !customerDataStr || !itemsStr) {
        console.error('[CheckoutCompleted] Missing required metadata');
        throw new Error('Missing required metadata in checkout session');
      }

      // Parse metadata
      const customer = JSON.parse(customerDataStr);
      const orderItems = JSON.parse(itemsStr);

      console.log('[CheckoutCompleted] Parsed data:', {
        customerEmail: customer.email,
        itemCount: orderItems.length,
      });
      console.log('[CheckoutCompleted] Order items structure:', JSON.stringify(orderItems, null, 2));

    // Create or get customer
    console.log('[CheckoutCompleted] Looking for customer:', customer.email);
    let dbCustomer = await this.prisma.customer.findFirst({
      where: {
        email: customer.email,
        tenantId,
      },
    });

    if (!dbCustomer) {
      console.log('[CheckoutCompleted] Creating new customer');
      dbCustomer = await this.prisma.customer.create({
        data: {
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          tenantId,
        },
      });
      console.log('[CheckoutCompleted] Customer created:', dbCustomer.id);
    } else {
      console.log('[CheckoutCompleted] Found existing customer:', dbCustomer.id);
    }

    // Create order
    console.log('[CheckoutCompleted] Creating order...');
    const order = await this.prisma.order.create({
      data: {
        tenantId,
        customerId: dbCustomer.id,
        status: 'PAID',
        subtotal: session.amount_subtotal! / 100,
        tax: session.total_details?.amount_tax
          ? session.total_details.amount_tax / 100
          : 0,
        shipping: session.total_details?.amount_shipping
          ? session.total_details.amount_shipping / 100
          : 0,
        total: session.amount_total! / 100,
        paymentIntentId: session.payment_intent as string,
        paymentMethod: 'card',
        ShippingfirstName: customer.firstName,
        ShippinglastName: customer.lastName,
        ShippingEmail: customer.email,
        ShippingContactNumber: customer.phone,
        ShippingAddress: customer.shippingAddress,
        ShippingCity: customer.shippingCity,
        ShippingState: customer.shippingState,
        ShippingDistrict: customer.shippingDistrict,
        ShippingCountry: customer.shippingCountry,
        customerNotes: customer.customerNotes,
        paidAt: new Date(),
        items: {
          create: orderItems.map((item: any) => {
            const itemData: any = {
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              productName: item.productName,
            };
            
            // Only include variantId if it exists
            if (item.variantId) {
              itemData.variantId = item.variantId;
            }
            
            // Only include variantName if it exists
            if (item.variantName) {
              itemData.variantName = item.variantName;
            }
            
            return itemData;
          }),
        },
      },
    });

    console.log('[CheckoutCompleted] Order created:', order.id);

    // Deduct inventory
    console.log('[CheckoutCompleted] Deducting inventory for', orderItems.length, 'items');
    for (const item of orderItems) {
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

    console.log('[CheckoutCompleted] Inventory updated successfully');
    // Optional: Send email confirmation
    // await this.emailService.sendOrderConfirmation(order);

    console.log('[CheckoutCompleted] Completed successfully for order:', order.id);
    return order;
    } catch (error) {
      console.error('[CheckoutCompleted] Error processing checkout:', error);
      console.error('[CheckoutCompleted] Error stack:', error.stack);
      throw error;
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    this.ensureStripe();
    
    let event: Stripe.Event;

    console.log('[Webhook] Processing webhook...');

    try {
      // Verify webhook signature
      const webhookSecret = this.configService.get<string>(
        'STRIPE_WEBHOOK_SECRET',
      );
      if (!webhookSecret) {
        console.error('[Webhook] STRIPE_WEBHOOK_SECRET not found in environment');
        throw new Error(
          'STRIPE_WEBHOOK_SECRET is not defined in environment variables',
        );
      }

      console.log('[Webhook] Verifying signature...');
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
      console.log('[Webhook] Signature verified. Event type:', event.type);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('[Webhook] Processing checkout.session.completed');
          const order = await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          console.log('[Webhook] Order created successfully:', order?.id);
          break;

        case 'payment_intent.succeeded':
          console.log('[Webhook] Payment succeeded:', event.data.object.id);
          break;

        case 'payment_intent.payment_failed':
          console.log('[Webhook] Payment failed:', event.data.object.id);
          break;

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (err: any) {
      console.error('[Webhook] Error handling event:', err.message);
      console.error('[Webhook] Stack trace:', err.stack);
      throw err;
    }

    return { received: true };
  }
}
