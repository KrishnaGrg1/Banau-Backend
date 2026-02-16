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
  TENANT_OWNER = 'TENANT_OWNER',
  TENANT_STAFF = 'TENANT_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum TenantStatusDto {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
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
  published:boolean

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