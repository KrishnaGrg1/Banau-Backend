import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  Response,
  UseGuards,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { OrderServices } from './order.service';
import { ApiResponseDto, AuthGuard } from 'src/common';
import { backendDtos } from '@repo/shared';
import Stripe from 'stripe';

@Controller('order')
export class OrderController {
  constructor(private readonly orderServices: OrderServices) {}

  @UseGuards(AuthGuard)
  @Get('')
  async getAllOrders(
    @Query() paginationDto: backendDtos.PaginationDto,
    @Request() req,
  ) {
    const data = await this.orderServices.getAllOrder(paginationDto, req);
    return ApiResponseDto.success(data, "Retrieved all tenant's orders");
  }
  @UseGuards(AuthGuard)
  @Get('export')
  async exportOrders(
    @Request() req,
    @Response({ passthrough: false }) res,
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
  ) {
    const { buffer, filename, mimeType } =
      await this.orderServices.exportOrders(req, format);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getOrderById(@Param('id') orderId: string, @Request() req) {
    const data = await this.orderServices.getOrderById(orderId, req);
    return ApiResponseDto.success(
      data,
      "Retrieved tenant's specific order by orderId",
    );
  }

  @UseGuards(AuthGuard)
  @Put(':id/status')
  async updateOrderStatus(
    @Request() req,
    @Param('id') orderId: string,
    @Body() dto: backendDtos.updateOrderStatus,
  ) {
    const order = await this.orderServices.updateOrderStatus(req, orderId, dto);
    return ApiResponseDto.success(
      order,
      "Retrieved all tenant's specific product by productId",
    );
  }

  @UseGuards(AuthGuard)
  @Put(':id/tracking')
  async addTracking(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: backendDtos.addTrackingDto,
  ) {
    const order = await this.orderServices.addTracking(req, id, dto);
    return ApiResponseDto.success(order, 'Tracking info added');
  }

  @UseGuards(AuthGuard)
  @Post(':id/refund')
  async refundOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: backendDtos.refundDto,
  ) {
    const order = await this.orderServices.refundOrder(req, id, dto);
    return ApiResponseDto.success(order, 'Order refunded');
  }

  @UseGuards(AuthGuard)
  @Get('my-orders')
  async getMyOrders(
    @Request() req,
    @Query() paginationDto: backendDtos.PaginationDto,
  ) {
    const orders = await this.orderServices.getCustomerOrders(
      req,
      paginationDto,
    );
    return ApiResponseDto.success(orders, 'Your orders retrieved');
  }

  @UseGuards(AuthGuard)
  @Get('my-orders/:id')
  async getMyOrder(@Request() req, @Param('id') id: string) {
    const order = await this.orderServices.getCustomerOrder(req, id);
    return ApiResponseDto.success(order, 'Order retrieved');
  }

  // ==========================================
  // PUBLIC ROUTES (Storefront Checkout)
  // ==========================================

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() dto: backendDtos.CreatePaymentIntentDto) {
    const intent = await this.orderServices.createPaymentIntent(dto);
    return ApiResponseDto.success(intent, 'Payment intent created');
  }

  @Post('confirm')
  async confirmOrder(@Body() dto: backendDtos.ConfirmOrderDto) {
    const order = await this.orderServices.confirmOrder(dto);
    return ApiResponseDto.success(order, 'Order confirmed');
  }

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() dto: backendDtos.CreateCheckoutSessionDto,
  ) {
    const session = await this.orderServices.createCheckoutSession(dto);
    return ApiResponseDto.success(session, 'Checkout session created');
  }

  @Post('webhook')
  async handleWebhook(
    @Request() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody || req.body;
    const result = await this.orderServices.handleWebhook(rawBody, signature);
    return result;
  }
}
