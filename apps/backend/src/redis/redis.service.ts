import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

// TTLs (seconds)
export const TTL = {
  STORE_PRODUCTS: 5 * 60, // 5 min — product listings
  STORE_PRODUCT: 10 * 60, // 10 min — single product by slug
  STORE_TENANT: 10 * 60, // 10 min — tenant details by subdomain
  SEARCH: 2 * 60, // 2 min — search results
} as const;

// Cache key builders
export const CacheKey = {
  storeProducts: (
    subdomain: string,
    filters: {
      page: number;
      limit: number;
      minPrice?: number;
      maxPrice?: number;
      inStockOnly?: boolean;
      sortBy?: string;
    },
  ) =>
    `store:products:${subdomain}:list:p${filters.page}:l${filters.limit}` +
    `:min${filters.minPrice ?? ''}:max${filters.maxPrice ?? ''}` +
    `:stock${filters.inStockOnly ? 1 : 0}:sort${filters.sortBy ?? 'newest'}`,

  storeSearch: (
    subdomain: string,
    query: string,
    page: number,
    limit: number,
  ) =>
    `store:search:${subdomain}:${encodeURIComponent(query)}:p${page}:l${limit}`,

  storeProduct: (subdomain: string, slug: string) =>
    `store:product:${subdomain}:${slug}`,

  storeTenant: (subdomain: string) => `store:tenant:${subdomain}`,

  storeProductsPrefix: (subdomain: string) => `store:products:${subdomain}:`,

  storeSearchPrefix: (subdomain: string) => `store:search:${subdomain}:`,

  products: (tenatId: string, page: number, limit: number) =>
    `tennat:products:${tenatId}:p${page}:l${limit}`,

  staffList: (tenantId: string, page: number, limit: number) =>
    `tenant:staff:${tenantId}:p${page}:l${limit}`,
  staffPrefix: (tenantId: string) => `tenant:staff:${tenantId}:`,
  staffById: (tenantId: string, staffId: string) =>
    `tenant:staff:${tenantId}:${staffId}`,
  staffExport: (tenantId: string) => `tenant:staff:${tenantId}:export`,
};

/** Hash a JWT access token for safe use as a Redis key. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class RedisService {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      url: this.config.getOrThrow<string>('UPSTASH_REDIS_REST_URL'),
      token: this.config.getOrThrow<string>('UPSTASH_REDIS_REST_TOKEN'),
    });
  }

  // --- Core operations -------------------------------------------------------

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.client.get<T>(key);
    } catch (e) {
      this.logger.warn(`Redis GET failed for "${key}": ${e.message}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, { ex: ttlSeconds });
      } else {
        await this.client.set(key, value);
      }
    } catch (e) {
      this.logger.warn(`Redis SET failed for "${key}": ${e.message}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!keys.length) return;
    try {
      await this.client.del(...keys);
    } catch (e) {
      this.logger.warn(`Redis DEL failed: ${e.message}`);
    }
  }

  /** Delete all keys that start with the given prefix using SCAN (non-blocking). */
  async invalidateByPrefix(prefix: string): Promise<void> {
    try {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, {
          match: `${prefix}*`,
          count: 100,
        });
        cursor = Number(nextCursor);
        if (keys.length > 0) await this.client.del(...keys);
      } while (cursor !== 0);
    } catch (e) {
      this.logger.warn(
        `Redis invalidateByPrefix failed for "${prefix}": ${e.message}`,
      );
    }
  }

  // --- Auth token blacklist --------------------------------------------------

  /**
   * Mark an access token as revoked. Pass in the already-hashed token (use
   * hashToken() from this module). Tokens expire automatically via `ttlSeconds`.
   */
  async revoke(tokenHash: string, ttlSeconds: number): Promise<void> {
    await this.set(`auth:revoked:${tokenHash}`, 1, ttlSeconds);
  }

  /**
   * Returns true if the access token has been revoked.
   * Fails OPEN (returns false) if Redis is unavailable — so a Redis outage
   * never locks out legitimate users.
   */
  async isRevoked(tokenHash: string): Promise<boolean> {
    try {
      const val = await this.client.exists(`auth:revoked:${tokenHash}`);
      return val === 1;
    } catch {
      return false;
    }
  }
}
