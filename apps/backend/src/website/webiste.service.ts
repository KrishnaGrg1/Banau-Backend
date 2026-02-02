import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CreateWebsiteDto} from '@repo/shared';

@Injectable()
export class WebsiteService {
  constructor(private prisma: PrismaService) {}

  async addDomain(userId, data: CreateWebsiteDto) {
    const existingWebsite = await this.prisma.website.findUnique({
      where: {
        subdomain: userId,
      },
    });
    if (existingWebsite) {
      throw new BadRequestException('User already has website');
    }
    const subdomainTaken = await this.prisma.website.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (subdomainTaken) {
      throw new ConflictException('Subdomain already taken');
    }
    const newWebsite = await this.prisma.website.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        ownerId: userId,
      }
    });
    return newWebsite;
  }

  async publishWebsite(userId) {
    const existingWebsite = await this.prisma.website.findUnique({
      where: {
        ownerId: userId,
      },
    });
    if (!existingWebsite) {
      throw new ConflictException('Website not created');
    }
    return await this.prisma.website.update({
      where: {
        ownerId: userId,
      },
      data: {
        published: true,
      },
    });
  }

  async getWebsiteDetails(userId) {
    const existingWebsite = await this.prisma.website.findUnique({
      where: {
        ownerId: userId,
      },
    });
    if (!existingWebsite) {
      throw new ConflictException('Website not created');
    }
    return existingWebsite;
  }
}
