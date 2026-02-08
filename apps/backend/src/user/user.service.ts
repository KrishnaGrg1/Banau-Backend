import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserServices {
  constructor(private prisma: PrismaService) {}

  async getMe(userId) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        tenant: {
          select: {
            name: true,
            subdomain: true,
          },
        },
      },
    });
    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }
    return existingUser;
  }
}
