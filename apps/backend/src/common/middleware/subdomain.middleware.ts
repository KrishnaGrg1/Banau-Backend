import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: () => void): void {
    req['subdomain'] = this.getFrontendSubdomain(req);
    next();
  }

  private getFrontendSubdomain(req: Request): string | null {
    const nodeEnv = this.configService.get('NODE_ENV');

    // In development or staging mode, return "dev"
    if (nodeEnv === 'development' || nodeEnv === 'staging') {
      return 'dev';
    }

    // Try Origin header first
    const origin = (req.headers['origin'] || req.headers['Origin']) as string | undefined;
    if (origin) {
      const subdomain = this.extractSubdomain(origin);
      if (subdomain) return subdomain;
    }

    // Try Referer header
    const referer = (req.headers['referer'] || req.headers['Referer']) as string | undefined;
    if (referer) {
      const subdomain = this.extractSubdomain(referer);
      if (subdomain) return subdomain;
    }

    // Try custom header
    const customHeader = req.headers['x-frontend-domain'] as string | undefined;
    if (customHeader) {
      const subdomain = this.extractSubdomain(customHeader);
      if (subdomain) return subdomain;
    }

    // Finally try Host header
    const host = (req.headers['host'] || req.headers['Host']) as string | undefined;
    if (host) {
      return this.extractSubdomain(host);
    }

    return null;
  }

  private extractSubdomain(domain: string | undefined): string | null {
    if (!domain) {
      return null;
    }

    let cleanedDomain = domain.toLowerCase();

    // Remove protocol if present
    if (cleanedDomain.includes('://')) {
      cleanedDomain = cleanedDomain.split('://')[1];
    }

    // Remove path if present
    if (cleanedDomain.includes('/')) {
      cleanedDomain = cleanedDomain.split('/')[0];
    }

    // Remove port if present
    if (cleanedDomain.includes(':')) {
      cleanedDomain = cleanedDomain.split(':')[0];
    }

    // Remove www prefix
    if (cleanedDomain.startsWith('www.')) {
      cleanedDomain = cleanedDomain.substring(4);
    }

    const domainParts = cleanedDomain.split('.');

    // If more than 2 parts (e.g., subdomain.domain.com), return the first part
    if (domainParts.length > 2) {
      return domainParts[0];
    }

    return null;
  }
}