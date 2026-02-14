import { Injectable } from '@nestjs/common';
import { UserRole } from '@repo/db/dist/generated/prisma/enums';
import { backendDtos } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminServices {
  constructor(private prisma: PrismaService) {}

  async getAllUser(paginationDto: backendDtos.PaginationDto) {
    const { limit = 10, offset = 0, role } = paginationDto;

    const whereCondition = {
      role: role ? role : { not: UserRole.SUPER_ADMIN },
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({
        where: whereCondition,
      }),
    ]);

    return {
      users,
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }
}
