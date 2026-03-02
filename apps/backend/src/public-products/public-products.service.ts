import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheKey, RedisService, TTL } from 'src/redis/redis.service';

@Injectable()
export class PublicProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // Backend — extend filters
  async getPublicProducts(
    subdomain: string,
    filters: {
      page: number;
      limit: number;
      minPrice?: number;
      maxPrice?: number;
      inStockOnly?: boolean;
      sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
    },
  ) {
    const cacheKey = CacheKey.storeProducts(subdomain, filters);
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    if (!tenant) throw new NotFoundException('Store not found');
    if (!tenant.published)
      throw new ForbiddenException('Store is not published');

    const skip = (filters.page - 1) * filters.limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          tenantId: tenant.id,
          status: 'ACTIVE',
          ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
            ? {
                price: {
                  ...(filters.minPrice !== undefined && {
                    gte: filters.minPrice,
                  }),
                  ...(filters.maxPrice !== undefined && {
                    lte: filters.maxPrice,
                  }),
                },
              }
            : {}),
          ...(filters.inStockOnly ? { quantity: { gt: 0 } } : {}),
        },
        include: { variants: true, featuredImage: true },
        skip,
        take: filters.limit,
        orderBy: {
          newest: { createdAt: 'desc' as const },
          oldest: { createdAt: 'asc' as const },
          price_asc: { price: 'asc' as const },
          price_desc: { price: 'desc' as const },
        }[filters.sortBy ?? 'newest'],
      }),
      this.prisma.product.count({
        where: {
          tenantId: tenant.id,
          status: 'ACTIVE',
          ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
            ? {
                price: {
                  ...(filters.minPrice !== undefined && {
                    gte: filters.minPrice,
                  }),
                  ...(filters.maxPrice !== undefined && {
                    lte: filters.maxPrice,
                  }),
                },
              }
            : {}),
          ...(filters.inStockOnly ? { quantity: { gt: 0 } } : {}),
        },
      }),
    ]);

    const result = {
      products,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
    await this.redis.set(cacheKey, result, TTL.STORE_PRODUCTS);
    return result;
  }

  async searchProducts(
    subdomain: string,
    options: { query: string; page: number; limit: number },
  ) {
    const cacheKey = CacheKey.storeSearch(
      subdomain,
      options.query,
      options.page,
      options.limit,
    );
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant || !tenant.published) {
      throw new NotFoundException('Store not found');
    }

    const skip = (options.page - 1) * options.limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          tenantId: tenant.id,
          status: 'ACTIVE',
          OR: [
            { name: { contains: options.query, mode: 'insensitive' } },
            { description: { contains: options.query, mode: 'insensitive' } },
            { sku: { contains: options.query, mode: 'insensitive' } },
          ],
        },
        include: {
          variants: true,
        },
        skip,
        take: options.limit,
      }),
      this.prisma.product.count({
        where: {
          tenantId: tenant.id,
          status: 'ACTIVE',
          OR: [
            { name: { contains: options.query, mode: 'insensitive' } },
            { description: { contains: options.query, mode: 'insensitive' } },
            { sku: { contains: options.query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const result = {
      products,
      query: options.query,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit),
      },
    };
    await this.redis.set(cacheKey, result, TTL.SEARCH);
    return result;
  }

  async getProductBySlug(subdomain: string, slug: string) {
    const cacheKey = CacheKey.storeProduct(subdomain, slug);
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant || !tenant.published) {
      throw new NotFoundException('Store not found');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      include: {
        variants: true,
        featuredImage: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.redis.set(cacheKey, product, TTL.STORE_PRODUCT);
    return product;
  }
}
