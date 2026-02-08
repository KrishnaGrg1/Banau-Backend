// Shared types across frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  published: boolean;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Token {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date | string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date | string;
}
