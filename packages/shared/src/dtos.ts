import { z } from "zod";

// Auth DTOs
export const CreateUserDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
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

// Website DTOs
export const CreateWebsiteDtoSchema = z.object({
  name: z.string().min(3),
  subdomain: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
});

export type CreateWebsiteDto = z.infer<typeof CreateWebsiteDtoSchema>;

export interface WebsiteResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    subdomain: string;
    published: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  timestamp: Date;
}
