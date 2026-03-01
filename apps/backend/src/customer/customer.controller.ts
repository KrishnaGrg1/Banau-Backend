import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiResponseDto, AuthGuard } from 'src/common';
import type { RequestWithUser } from 'src/common';
import { CustomerServices } from './customer.service';
import { backendDtos } from '@repo/shared';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerServices: CustomerServices) {}

  @UseGuards(AuthGuard)
  @Get()
  async listCustomers(
    @Request() req: RequestWithUser,
    @Query() paginationDto: backendDtos.PaginationDto,
  ) {
    const data = await this.customerServices.listAllCustomers(
      req,
      paginationDto,
    );
    return ApiResponseDto.success(data, "Retrieved all tenant's customers");
  }

  @UseGuards(AuthGuard)
  @Get('export')
  async exportCustomers(
    @Request() req,
    @Response({ passthrough: false }) res,
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
  ) {
    const { buffer, filename, mimeType } =
      await this.customerServices.exportCustomers(req, format);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getCustomerById(
    @Request() req: RequestWithUser,
    @Param('id') customerId: string,
  ) {
    const data = await this.customerServices.getCustomerById(req, customerId);
    return ApiResponseDto.success(data, 'Retrieved customer by CustomerId');
  }

  @UseGuards(AuthGuard)
  @Get(':id/orders')
  async getCustomerOrders(
    @Request() req,
    @Param('id') customerId: string,
    @Query() paginationDto: backendDtos.PaginationDto,
  ) {
    const data = await this.customerServices.getCustomerOrders(
      req,
      customerId,
      paginationDto,
    );
    return ApiResponseDto.success(data, 'Customer orders retrieved');
  }

  @UseGuards(AuthGuard)
  @Post('')
  async registerCustomer(
    @Request() req: RequestWithUser,
    @Body() dto: backendDtos.CreateCustomerDto,
  ) {
    const data = await this.customerServices.createCustomer(req, dto);
    return ApiResponseDto.success(data, "Retrieved all tenant's customers");
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateCustomer(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: backendDtos.UpdateCustomerDto,
  ) {
    const customer = await this.customerServices.updateCustomer(req, id, dto);
    return ApiResponseDto.success(customer, 'Customer updated');
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteCustomer(@Request() req, @Param('id') id: string) {
    await this.customerServices.deleteCustomer(req, id);
    return ApiResponseDto.success(null, 'Customer deleted');
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    const customer = await this.customerServices.getMyProfile(req);
    return ApiResponseDto.success(customer, 'Profile retrieved');
  }

  @UseGuards(AuthGuard)
  @Put('me')
  async updateMyProfile(
    @Request() req,
    @Body() dto: backendDtos.UpdateCustomerDto,
  ) {
    const customer = await this.customerServices.updateMyProfile(req, dto);
    return ApiResponseDto.success(customer, 'Profile updated');
  }

  @UseGuards(AuthGuard)
  @Get('me/orders')
  async getMyOrders(
    @Request() req,
    @Query() pagination: backendDtos.PaginationDto,
  ) {
    const orders = await this.customerServices.getMyOrders(req, pagination);
    return ApiResponseDto.success(orders, 'Your orders retrieved');
  }

  // PUBLIC ROUTES (Storefront)

  @Post('register')
  async register(
    @Body() dto: backendDtos.RegisterCustomerDto,
    @Res({ passthrough: true }) res: Response, // ✅ passthrough lets NestJS handle response
  ) {
    const result = await this.customerServices.registerCustomer(dto, res);
    return ApiResponseDto.success(result, 'Customer registered successfully');
  }

  @Post('login')
  async login(
    @Body() dto: backendDtos.LoginCustomerDto,
    @Res({ passthrough: true }) res: Response, // ✅ passthrough
  ) {
    const result = await this.customerServices.loginCustomer(dto, res);
    return ApiResponseDto.success(result, 'Login successful');
  }
}
