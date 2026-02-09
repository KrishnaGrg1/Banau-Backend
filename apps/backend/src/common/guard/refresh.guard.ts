import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RequestWithUser } from '../interfaces/request.interface';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const refreshToken = this.extractRefreshTokenFromHeader(request);

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      // Verify JWT refresh token using the REFRESH secret
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'your-refresh-secret-key',
      });

      // Attach user data to request for use in decorators and controllers
      request.user = { id: payload.sub };
      request.refreshToken = refreshToken;
      request.accessToken = request.cookies.accessToken; // Store the accessToken if present
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return true;
  }

  private extractRefreshTokenFromHeader(request: Request): string | undefined {
    // Check cookies first
    if (request.cookies && request.cookies.refreshToken) {
      return request.cookies.refreshToken;
    }
    // Then check Authorization header as fallback
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
