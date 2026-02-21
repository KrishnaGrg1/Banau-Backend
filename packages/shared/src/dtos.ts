import { z } from "zod";
import { User } from "@repo/db/dist/generated/prisma/client";
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
const hexColor = /^#([0-9A-F]{3}){1,2}$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const CreateTenantSettingDtoSchema = z.object({
  primaryColorCode: z.string().regex(hexColor, "Invalid hex color"),
  secondaryColorCode: z.string().regex(hexColor, "Invalid hex color"),
  primaryTextColorCode: z.string().regex(hexColor, "Invalid hex color"),
  secondaryTextColorCode: z.string().regex(hexColor, "Invalid hex color"),
  backgroundColorCode: z.string().regex(hexColor, "Invalid hex color"),
  backgroundTextColorCode: z.string().regex(hexColor, "Invalid hex color"),

  landingPageTitle: z.string().nonempty("Landing page title is required"),
  landingPageDescription: z
    .string()
    .nonempty("Landing page description is required"),

  // Optional files (logo and favicon)
  logo: z
    .unknown()
    .optional()
    .refine(
      (file: any) => !file || file.mimetype?.startsWith("image/"),
      "Logo must be an image file",
    )
    .refine(
      (file: any) => !file || file.size <= MAX_FILE_SIZE,
      "Logo must be smaller than 10MB",
    ),

  favicon: z
    .unknown()
    .optional()
    .refine(
      (file: any) => !file || file.mimetype?.startsWith("image/"),
      "Favicon must be an image file",
    )
    .refine(
      (file: any) => !file || file.size <= MAX_FILE_SIZE,
      "Favicon must be smaller than 10MB",
    ),
});

export type CreateTenantSettingDto = z.infer<
  typeof CreateTenantSettingDtoSchema
>;

export interface TenantSettingResponse {
  success: boolean;
  message: string;
  data: Setting;
  timestamp: Date;
}

export interface TenantSettingAssetsResponse {
  success: boolean;
  message: string;
  data: {
    logo: Asset;
    favicon: Asset;
  };
  timestamp: Date;
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data: any }>;
}

export const ForgotPasswordDtoSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordDtoSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}
export const ProductStatusDto = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"], {
  required_error: "Status is required",
  invalid_type_error: "Status must be DRAFT, ACTIVE, or ARCHIVED",
});

// CreateProductDto
export const CreateProductDtoSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  slug: z
    .string({ required_error: "Slug is required" })
    .min(2, "Slug must be at least 2 characters"),
  price: z.union([z.number(), z.string()], {
    required_error: "Price is required",
  }),
  compareAtPrice: z.union([z.number(), z.string()]).optional(),
  quantity: z.number().optional().default(0),
  trackInventory: z.boolean().optional().default(true),
  featuredImageId: z.string().optional(),
  status: ProductStatusDto.optional().default("DRAFT"),
  featured: z.boolean().optional().default(false),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  weight: z.number().optional(),
  weightUnit: z.string().optional(),
  taxable: z.boolean().optional().default(true),
});

export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;

export interface ProductDto {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  slug: string;

  // ✅ String, not Decimal
  price: string;
  compareAtPrice: string | null;

  quantity: number;
  trackInventory: boolean;
  sku: string | null;
  barcode: string | null;
  featuredImageId: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;

  // ✅ String, not Decimal
  weight: string | null;
  weightUnit: string | null;

  taxable: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;

  variants?: ProductVariantDto[];
  imageUrl?: string;
}

export interface ProductVariantDto {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  barcode: string | null;

  // ✅ String, not Decimal
  price: string | null;
  compareAtPrice: string | null;

  quantity: number;
  option1Name: string | null;
  option1Value: string | null;
  option2Name: string | null;
  option2Value: string | null;
  option3Name: string | null;
  option3Value: string | null;
  imageUrl: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductResponse {
  success: boolean;
  message: string;
  data: ProductDto; // ✅ Use ProductDto
  timestamp: Date;
}

// UpdateProductDto
export const UpdateProductDtoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().optional(),
  slug: z.string().min(2, "Slug must be at least 2 characters").optional(),
  price: z.union([z.number(), z.string()]).optional(),
  compareAtPrice: z.union([z.number(), z.string()]).optional(),
  quantity: z.number().optional(),
  trackInventory: z.boolean().optional(),
  featuredImageId: z.string().optional(),
  status: ProductStatusDto.optional(),
  featured: z.boolean().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  weight: z.number().optional(),
  weightUnit: z.string().optional(),
  taxable: z.boolean().optional(),
  // Image upload fields (base64 string and filename)
  product_image: z.string().optional(),
  productImageName: z.string().optional(),
});
export const UpdateProductInputSchema = z.object({
  id: z.string(),
  product: UpdateProductDtoSchema,
});

export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;

// CreateVariantDto
export const CreateVariantDtoSchema = z.object({
  name: z
    .string({ required_error: "Variant name is required" })
    .min(1, "Variant name must be at least 1 character"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().optional(),
  compareAtPrice: z.number().optional(),
  quantity: z.number().optional().default(0),
  option1Name: z.string().optional(),
  option1Value: z.string().optional(),
  option2Name: z.string().optional(),
  option2Value: z.string().optional(),
  option3Name: z.string().optional(),
  option3Value: z.string().optional(),
});

export type CreateVariantDto = z.infer<typeof CreateVariantDtoSchema>;

// UpdateVariantDto
export const UpdateVariantDtoSchema = z.object({
  name: z
    .string()
    .min(1, "Variant name must be at least 1 character")
    .optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().optional(),
  compareAtPrice: z.number().optional(),
  quantity: z.number().optional(),
  option1Name: z.string().optional(),
  option1Value: z.string().optional(),
  option2Name: z.string().optional(),
  option2Value: z.string().optional(),
  option3Name: z.string().optional(),
  option3Value: z.string().optional(),
});

export type UpdateVariantDto = z.infer<typeof UpdateVariantDtoSchema>;

// UpdateStockDto
export const UpdateStockDtoSchema = z.object({
  quantity: z.number({ required_error: "Quantity is required" }),
  action: z.enum(["set", "add", "subtract"], {
    required_error: "Action is required",
    invalid_type_error: "Action must be set, add, or subtract",
  }),
  variantId: z.string().optional(),
  reason: z.string().optional(),
});

export type UpdateStockDto = z.infer<typeof UpdateStockDtoSchema>;

export interface getAllProductsResponse {
  success: boolean;
  message: string;
  data: {
    existingProducts: ProductDto;
    meta: {
      total: number;
      limit: number;
      offset: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  timeStamp: Date;
}

export const CreateProductFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  description: z.string(),

  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Only lowercase letters, numbers, and hyphens allowed",
    ),

  price: z
    .union([z.number(), z.string()])
    .refine((v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 0, {
      message: "Price is required and must be a non-negative number",
    }),

  compareAtPrice: z
    .union([z.number(), z.string()])
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Must be a non-negative number",
    }),

  quantity: z.number().min(0, "Quantity cannot be negative"),

  trackInventory: z.boolean(),

  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),

  featured: z.boolean(),

  sku: z.string(),

  barcode: z.string(),

  metaTitle: z.string(),

  metaDescription: z.string(),

  weight: z
    .union([z.number(), z.string()])
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Weight must be a non-negative number",
    }),

  weightUnit: z.string(),

  taxable: z.boolean(),

  // base64 data-URL string set by FileReader; undefined when no image selected.
  // Use z.string().or(z.undefined()) instead of .optional() so the key is required
  // in the schema input type (matching the form defaultValue: undefined as string | undefined).
  product_image: z.string().or(z.undefined()),
  productImageName: z.string().optional(),
});

export type CreateProductFormValues = z.infer<typeof CreateProductFormSchema>;

export const exportProductParamsSchema = z.object({
  format: z.enum(["csv", "xlsx"]),
});

export interface bulkImportProductsResponse {
  success: boolean;
  message: string;
  data: {
    success: number;
    failed: number;
    errors: string[];
  };
  timestamp: Date;
}

export const bulkImportSchema = z.object({
  file: z.string(),
  filename: z.string(),
});

export const DeleteProductSchema = z.object({
  productId: z.string(),
});
