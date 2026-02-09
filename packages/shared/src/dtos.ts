import { z } from "zod";

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
    token: string;
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
