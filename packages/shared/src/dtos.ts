import { z } from "zod";
import { User } from '@repo/db/dist/generated/prisma/client';
import { Setting } from "@repo/db/dist/generated/prisma/client";
import { Asset } from "@repo/db/dist/generated/prisma/client";
// Auth DTOs
export const CreateUserDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  // role:z.enum(['SUPER_ADMIN','TENANT_OWNER','TENANT_STAFF','CUSTOMER'])
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
    accessToken: string;
    refreshToken: string;
  };
  timestamp: Date;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  timestamp: Date;
}

// Tenant DTOs
export const CreateTenantDtoSchema = z.object({
  name: z.string().min(3),
  subdomain: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  status: z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED"]).optional(),
});

export type CreateTenantDto = z.infer<typeof CreateTenantDtoSchema>;

export interface TenantResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    subdomain: string;
    published: boolean;
    ownerId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  timestamp: Date;
}

export const getTenantDetailsBySubdomainSchema = z.object({
  subdomain: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
});

export type getTenantDetailsBySubdomainDto = z.infer<
  typeof getTenantDetailsBySubdomainSchema
>;

export const VerifyUserSchema = z.object({
  token: z.string().min(4),
  userId: z.string(),
});

export type verifyUserDto = z.infer<typeof VerifyUserSchema>;

export interface refreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    existingUser: User;
    accessToken: string;
    refreshToken: string;
  };
  timestamp: Date;
}

interface ownedTenants {
  name: string;
  subdomain: string;
  email: string;
  published: boolean;
}
export interface getMeResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: Date;
    lastLoginAt: Date;
    isActive: boolean;
    ownedTenant: ownedTenants[];
  };
  timestamp: Date;
}

// Auth DTOs
export const paginationDtoSchema = z.object({
  limit: z.number().positive().optional(),
  offset: z.number().min(0).optional(),
  role: z.enum(["TENANT_OWNER", "TENANT_STAFF", "CUSTOMER"]).optional(),
});

export type paginationDto = z.infer<typeof paginationDtoSchema>;


// Regex for hex color validation
const hexColor = /^#([0-9A-F]{3}){1,2}$/i
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export const CreateTenantSettingDtoSchema = z.object({
  primaryColorCode: z.string().regex(hexColor, 'Invalid hex color'),
  secondaryColorCode: z.string().regex(hexColor, 'Invalid hex color'),
  primaryTextColorCode: z.string().regex(hexColor, 'Invalid hex color'),
  secondaryTextColorCode: z.string().regex(hexColor, 'Invalid hex color'),
  backgroundColorCode: z.string().regex(hexColor, 'Invalid hex color'),
  backgroundTextColorCode: z.string().regex(hexColor, 'Invalid hex color'),

  landingPageTitle: z.string().nonempty('Landing page title is required'),
  landingPageDescription: z
    .string()
    .nonempty('Landing page description is required'),

  // Optional files (logo and favicon)
  logo: z
    .unknown()
    .optional()
    .refine(
      (file: any) => !file || file.mimetype?.startsWith('image/'),
      'Logo must be an image file'
    )
    .refine(
      (file: any) => !file || file.size <= MAX_FILE_SIZE,
      'Logo must be smaller than 10MB'
    ),

  favicon: z
    .unknown()
    .optional()
    .refine(
      (file: any) => !file || file.mimetype?.startsWith('image/'),
      'Favicon must be an image file'
    )
    .refine(
      (file: any) => !file || file.size <= MAX_FILE_SIZE,
      'Favicon must be smaller than 10MB'
    ),
})

export type CreateTenantSettingDto = z.infer<typeof CreateTenantSettingDtoSchema>



export interface TenantSettingResponse {
  success: boolean;
  message: string;
  data:Setting
  timestamp: Date;
}


export interface TenantSettingAssetsResponse {
  success: boolean;
  message: string;
  data:{
    logo:Asset,
    favicon:Asset
  }
  timestamp: Date;
}