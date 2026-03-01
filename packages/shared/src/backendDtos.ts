import {
  IsOptional,
  IsPositive,
  Min,
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
} from "class-validator";
import type { Express } from "express";

export enum UserRoleDto {
  TENANT_OWNER = "TENANT_OWNER",
  TENANT_STAFF = "TENANT_STAFF",
  CUSTOMER = "CUSTOMER",
}

export enum TenantStatusDto {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CANCELLED = "CANCELLED",
}

export enum ProductStatusDto {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

// =========================
// Auth DTOs
// =========================

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class VerifyUserDto {
  @IsString()
  @MinLength(4)
  token: string;

  @IsString()
  userId: string;
}

// Tenant DTOs

export class CreateTenantDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/)
  subdomain: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(TenantStatusDto)
  status?: TenantStatusDto;
}

export class GetTenantDetailsBySubdomainDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/)
  subdomain: string;
}

// =========================
// getMe DTO
// =========================

export class OwnedTenantDto {
  @IsString()
  name: string;

  @IsString()
  subdomain: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  published: boolean;
}

// =========================
// Pagination DTO
// =========================

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsEnum(UserRoleDto)
  role?: UserRoleDto;
}

export class UpdateTenantDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/)
  subdomain: string;

  @IsEmail()
  email: string;

  @IsEnum(TenantStatusDto)
  status?: TenantStatusDto;

  @IsBoolean()
  published: boolean;
}

export class CreateTenantSettingDto {
  // Color codes
  @IsHexColor()
  primaryColorCode: string;

  @IsHexColor()
  secondaryColorCode: string;

  @IsHexColor()
  primaryTextColorCode: string;

  @IsHexColor()
  secondaryTextColorCode: string;

  @IsHexColor()
  backgroundColorCode: string;

  @IsHexColor()
  backgroundTextColorCode: string;

  // Landing page info
  @IsString()
  @IsNotEmpty()
  landingPageTitle: string;

  @IsString()
  @IsNotEmpty()
  landingPageDescription: string;

  // Optional files (handled separately in controller)
  @IsOptional()
  logo?: Express.Multer.File;

  @IsOptional()
  favicon?: Express.Multer.File;
}

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(2)
  slug: string;

  // Pricing
  @IsNotEmpty()
  price: number | string;

  @IsOptional()
  compareAtPrice?: number | string;

  // Inventory
  @IsOptional()
  @IsNumber()
  quantity?: number = 0;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean = true;

  // Featured image
  @IsOptional()
  @IsString()
  featuredImageId?: string;

  // Status
  @IsOptional()
  @IsEnum(ProductStatusDto)
  status?: ProductStatusDto = ProductStatusDto.DRAFT;

  @IsOptional()
  @IsBoolean()
  featured?: boolean = false;

  // SKU & Barcode
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  // SEO
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  // Shipping
  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  weightUnit?: string;

  // Tax
  @IsOptional()
  @IsBoolean()
  taxable?: boolean = true;

  // publishedAt is set by backend, not client
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @IsOptional()
  price?: number | string;

  @IsOptional()
  compareAtPrice?: number | string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsString()
  featuredImageId?: string;

  @IsOptional()
  @IsEnum(ProductStatusDto)
  status?: ProductStatusDto;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  // SKU & Barcode
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  // SEO
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  // Shipping
  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  weightUnit?: string;

  // Tax
  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  // publishedAt is set by backend, not client
}

// =========================
// Variant DTOs
// =========================
export class CreateVariantDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number = 0;

  @IsOptional()
  @IsString()
  option1Name?: string;

  @IsOptional()
  @IsString()
  option1Value?: string;

  @IsOptional()
  @IsString()
  option2Name?: string;

  @IsOptional()
  @IsString()
  option2Value?: string;

  @IsOptional()
  @IsString()
  option3Name?: string;

  @IsOptional()
  @IsString()
  option3Value?: string;
}

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  option1Name?: string;

  @IsOptional()
  @IsString()
  option1Value?: string;

  @IsOptional()
  @IsString()
  option2Name?: string;

  @IsOptional()
  @IsString()
  option2Value?: string;

  @IsOptional()
  @IsString()
  option3Name?: string;

  @IsOptional()
  @IsString()
  option3Value?: string;
}

// =========================
// Stock DTO
// =========================
export class UpdateStockDto {
  @IsNumber()
  quantity: number;

  @IsEnum(["set", "add", "subtract"])
  action: "set" | "add" | "subtract";

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class updateOrderStatus {
  @IsEnum([
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
    "FAILED",
  ])
  status:
    | "PENDING"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
    | "FAILED";
}

export class addTrackingDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  trackingCarrier: string;
}

export class refundDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

// =========================
// Payment & Order DTOs
// =========================

export class PaymentIntentItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreatePaymentIntentDto {
  @IsString()
  subdomain: string;

  @IsNotEmpty({ each: true })
  items: PaymentIntentItemDto[];
}

export class ConfirmOrderDto {
  @IsString()
  paymentIntentId: string;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  shippingAddress: string;

  @IsString()
  shippingCity: string;

  @IsString()
  shippingState: string;

  @IsOptional()
  @IsString()
  shippingDistrict?: string;

  @IsString()
  shippingCountry: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsNumber()
  shipping?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsNotEmpty({ each: true })
  items: ConfirmOrderItemDto[];
}

export class ConfirmOrderItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  price: number;

  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  variantName?: string;
}

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateCustomerDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class RegisterCustomerDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/)
  subdomain: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class LoginCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// =========================
// Stripe Checkout Session DTOs
// =========================

export class CheckoutSessionItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  price: number;

  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  variantName?: string;
}

export class CreateCheckoutSessionDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/)
  subdomain: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  shippingAddress: string;

  @IsString()
  shippingCity: string;

  @IsString()
  shippingState: string;

  @IsOptional()
  @IsString()
  shippingDistrict?: string;

  @IsString()
  shippingCountry: string;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsNotEmpty({ each: true })
  items: CheckoutSessionItemDto[];
}
