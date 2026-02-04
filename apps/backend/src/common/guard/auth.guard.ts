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
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Verify JWT token using the secret from environment
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      });

      // Attach user data to request for use in decorators and controllers
      request.user = { id: payload.sub };
      request.token = token; // Store the token for logout operations
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (request.cookies && request.cookies.uid) {
      return request.cookies.uid;
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
