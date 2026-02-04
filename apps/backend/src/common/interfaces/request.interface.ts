import { Request } from 'express';

/**
 * Authenticated user object attached to the request by AuthGuard
 */
export interface AuthenticatedUser {
  id: string;
}

/**
 * Extended Request interface with user and token properties
 * populated by AuthGuard middleware
 */
export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
  token?: string;
  subdomain?: string | null;
}
