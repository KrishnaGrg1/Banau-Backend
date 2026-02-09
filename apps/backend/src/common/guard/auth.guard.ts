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
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const accessToken = this.extractTokenFromHeader(request);

    if (!accessToken) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Verify JWT token using the secret from environment
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          'your-secret-key',
      });

      // Attach user data to request for use in decorators and controllers
      request.user = { id: payload.sub };
      request.refreshToken = request.cookies.refreshToken;
      request.accessToken = accessToken; // Store the token for logout operations
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (request.cookies && request.cookies.accessToken) {
      return request.cookies.accessToken;
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
