import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Request,
  Response,

  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { backendDtos, BulkImportResult } from '@repo/shared';
import { ApiResponseDto, AuthGuard } from 'src/common';
import { FileSizeValidationPipe } from 'src/common/validation/fileValidation';
import { ProductServices } from './products.service';

@UseGuards(AuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productsServices: ProductServices) {}

  @Get('')
  async getAllProducts(
    @Query() paginationDto: backendDtos.PaginationDto,
    @Request() req,
  ) {
    const data = await this.productsServices.getAllProducts(paginationDto, req);
    return ApiResponseDto.success(data, "Retrieved all tenant's products");
  }
  @Get('low-stock')
  async getLowStockProducts(
    @Request() req,
    @Query('threshold') threshold: string = '10',
  ) {
    const products = await this.productsServices.getLowStockProducts(
      req,
      parseInt(threshold),
    );
    return ApiResponseDto.success(products, 'Low stock products retrieved');
  }
  @Get('export')
  async exportProducts(
    @Request() req,
    @Response({ passthrough: false }) res,
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
  ) {
    const { buffer, filename, mimeType } =
      await this.productsServices.exportProducts(req, format);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id')
  async getProductById(@Param(':id') productId: string, @Request() req) {
    const data = await this.productsServices.getProductbyProductId(
      req,
      productId,
    );
    return ApiResponseDto.success(
      data,
      "Retrieved all tenant's specific product by productId",
    );
  }

  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'product_image', maxCount: 1 }], {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async createProduct(
    @Request() req,
    @Body() dto: backendDtos.CreateProductDto,
    @UploadedFiles(new FileSizeValidationPipe())
    file: { product_image?: Express.Multer.File[] },
  ) {
    const data = await this.productsServices.createProduct(req, dto, {
      product_image: file.product_image?.[0],
    });
    return ApiResponseDto.success(data, "Created tenant's products");
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'product_image', maxCount: 1 }], {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async updateProduct(
    @Request() req,
    @Param(':id') productId: string,
    @Body() dto: backendDtos.UpdateProductDto,
    @UploadedFiles(new FileSizeValidationPipe())
    file: { product_image: Express.Multer.File },
  ) {
    const productImage = file?.product_image?.[0];
    const data = await this.productsServices.updateProduct(
      req,
      productId,
      dto,
      { product_image: productImage },
    );
    return ApiResponseDto.success(
      data,
      "Updated tenant's products successfully",
    );
  }

  @Delete(':id')
  async deleteProductbyId(@Param(':id') productId, @Request() req) {
    await this.productsServices.deleteProductByid(req, productId);
    return ApiResponseDto.success(
      null,
      "Deleted tenant's products successfully",
    );
  }

  @Post('bulk')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'file',
          maxCount: 1,
        },
      ],
      {
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      },
    ),
  )
  async bulkImport(
    @Request() req,
    @UploadedFiles(new FileSizeValidationPipe())
    file: { file: Express.Multer.File[] },
  ): Promise<ApiResponseDto<BulkImportResult>> {
    if (!file) throw new Error('No file uploaded');
    const bulkFile = file.file?.[0];
    const result = await this.productsServices.bulkImport(req, {
      file: bulkFile,
    });
    return ApiResponseDto.success(result, 'Imported products successfully');
  }

  @Post(':id/variants')
  async addVariant(
    @Request() req,
    @Param('id') productId: string,
    @Body() dto: backendDtos.CreateVariantDto,
  ) {
    const variant = await this.productsServices.addVariant(req, productId, dto);
    return ApiResponseDto.success(variant, 'Variant added successfully');
  }
  @Put(':id/variants/:variantId')
  async updateVariant(
    @Request() req,
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: backendDtos.UpdateVariantDto,
  ) {
    const variant = await this.productsServices.updateVariant(
      req,
      productId,
      variantId,
      dto,
    );
    return ApiResponseDto.success(variant, 'Variant updated successfully');
  }
  @Delete(':id/variants/:variantId')
  async deleteVariant(
    @Request() req,
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
  ) {
    await this.productsServices.deleteVariant(req, productId, variantId);
    return ApiResponseDto.success(null, 'Variant deleted successfully');
  }

  @Put(':id/stock')
  async updateStock(
    @Request() req,
    @Param('id') productId: string,
    @Body() dto: backendDtos.UpdateStockDto,
  ) {
    const product = await this.productsServices.updateStock(
      req,
      productId,
      dto,
    );
    return ApiResponseDto.success(product, 'Stock updated successfully');
  }
  
}
