import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  RequestWithUser,
} from '../interfaces/request.interface';

/**
 * User decorator to extract authenticated user data from the request.
 * This decorator relies on the AuthGuard middleware to populate request.user
 * with the authenticated user information.
 *
 * @example
 * // Get the entire user object
 * async getProfile(@User() user: AuthenticatedUser) { ... }
 *
 * // Get a specific property (e.g., id)
 * async createPost(@User('id') userId: string) { ... }
 */
export const User = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    Logger.log('User', user);
    // Ensure user exists (should be populated by AuthGuard)
    if (!user) {
      throw new UnauthorizedException(
        'User not authenticated. Ensure AuthGuard is applied.',
      );
    }

    // If a specific property is requested, return it
    if (data) {
      const value = user[data];
      if (value === undefined) {
        throw new UnauthorizedException(
          `User property '${data}' not found in authenticated user.`,
        );
      }
      return value;
    }

    // Return the entire user object
    return user;
  },
);
