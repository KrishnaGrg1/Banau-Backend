import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithUser } from '../interfaces/request.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@repo/db/dist/generated/prisma/enums';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: request.user.id },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new ForbiddenException('User not active');
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
