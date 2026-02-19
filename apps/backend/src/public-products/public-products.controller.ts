import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponseDto } from 'src/common';
import { PublicProductService } from './public-products.service';

@Controller('public/:subdomain/products')
export class PublicProductController {
  constructor(private readonly productService: PublicProductService) {}

  @Get()
  async listStoreProducts(
    @Param('subdomain') subdomain: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const products = await this.productService.getPublicProducts(subdomain, {
      category,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return ApiResponseDto.success(products);
  }

  @Get('search')
  async searchProducts(
    @Param('subdomain') subdomain: string,
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const products = await this.productService.searchProducts(subdomain, {
      query,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return ApiResponseDto.success(products);
  }

  @Get(':slug')
  async getProductBySlug(
    @Param('subdomain') subdomain: string,
    @Param('slug') slug: string,
  ) {
    const product = await this.productService.getProductBySlug(subdomain, slug);
    return ApiResponseDto.success(product);
  }
}
