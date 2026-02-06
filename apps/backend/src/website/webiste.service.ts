import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CreateWebsiteDto } from '@repo/shared';

@Injectable()
export class WebsiteService {
  constructor(private prisma: PrismaService) {}

  async addDomain(userId: string, data: CreateWebsiteDto) {
    const existingOwner = await this.prisma.website.findUnique({
      where: { ownerId: userId },
    });
    if (existingOwner)
      throw new BadRequestException('User already has a website');

    const subdomainTaken = await this.prisma.website.findUnique({
      where: { subdomain: data.subdomain },
    });
    if (subdomainTaken) throw new ConflictException('Subdomain already taken');

    return this.prisma.website.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        ownerId: userId,
      },
    });
  }

  async publishWebsite(userId: string) {
    const website = await this.getWebsiteDetails(userId);

    return this.prisma.website.update({
      where: { id: website.id },
      data: { published: true },
    });
  }

  async getWebsiteDetails(userId: string) {
    const website = await this.prisma.website.findUnique({
      where: { ownerId: userId },
    });

    if (!website) throw new ConflictException('Website not found');
    return website;
  }

  async getWebsiteDetailsBySubdomain(subdomain: string) {
    const website = await this.prisma.website.findFirst({
      where: { subdomain },
    });

    if (!website) throw new ConflictException('Website not found');
    return website;
  }
}
