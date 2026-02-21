import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AssetType } from '@repo/db/dist/generated/prisma/enums';
import { backendDtos, BulkImportResult } from '@repo/shared';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as Papa from 'papaparse';

@Injectable()
export class ProductServices {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryServices: CloudinaryService,
  ) {}
  private async verifyProductOwnership(req: any, productId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { ownerId: String(req.user.id) },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
        tenantId: tenant.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
  async getAllProducts(paginationDto: backendDtos.PaginationDto, req) {
    const { limit = 10, offset = 0, role } = paginationDto;
    const existingTenant = await this.prisma.tenant.findFirst({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!existingTenant) throw new ConflictException('User dont have tenants');
    const [existingProducts, total] = await Promise.all([
      await this.prisma.product.findMany({
        where: {
          tenantId: String(existingTenant.id),
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          featuredImage: true,
        },
      }),
      this.prisma.product.count({
        where: {
          tenantId: String(existingTenant.id),
        },
      }),
    ]);
    return {
      existingProducts: await Promise.all(
        existingProducts.map(async (product) => {
          let imageUrl: string | null = null;
          if (product.featuredImageId) {
            const asset = await this.prisma.asset.findUnique({
              where: { id: product.featuredImageId },
            });
            imageUrl = asset?.url || null;
          }
          return productToDto({ ...product, imageUrl });
        }),
      ),
      meta: {
        total,
        limit,
        offset,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    };
  }
  async getProductbyProductId(req, productId: string) {
    const product = await this.verifyProductOwnership(req, productId);
    return productToDto(product);
  }

  async createProduct(
    req,
    data: backendDtos.CreateProductDto,
    file: { product_image?: Express.Multer.File },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        slug: String(data.slug),
        tenantId: tenant.id.toString(),
      },
    });
    if (existingProduct)
      throw new ConflictException('Tenant slug already exists');
    const product_image = file.product_image;
    Logger.log(file);
    let uploadImage;

    if (product_image) {
      uploadImage = await this.cloudinaryServices.uploadFile(
        product_image,
        `tenants/${tenant.id}/products/`,
      );
      Logger.log('upload image', uploadImage);
    }
    return productToDto(
      await this.prisma.$transaction(async (tx) => {
        let imageId: string | null = null;
        if (uploadImage) {
          const asset = await tx.asset.create({
            data: {
              fileName: product_image!.originalname,
              url: uploadImage.secure_url,
              type: AssetType.PRODUCT_IMAGE,
              tenantId: String(tenant.id),
              fileSize: product_image!.size,
              mimeType: product_image!.mimetype,
            },
          });
          Logger.log('working', asset);
          imageId = asset.id;
        }
        return tx.product.create({
          data: {
            ...data,
            featuredImageId: imageId,
            tenantId: String(tenant.id),
          },
        });
      }),
    );
  }

  async updateProduct(
    req,
    productId: string,
    data: backendDtos.UpdateProductDto,
    file: { product_image: Express.Multer.File },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    // Exclude current product from slug uniqueness check
    const product = await this.verifyProductOwnership(req, productId);
    const product_image = file.product_image;

    const normalizedSlug = data.slug?.trim().toLowerCase();
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        slug: normalizedSlug,
        tenantId: tenant.id,
        id: {
          not: product.id,
        },
      },
    });

    if (existingProduct)
      throw new ConflictException('Tenant slug already exists');

    let uploadImage;
    let imageId = product.featuredImageId || null;

    if (product_image) {
      uploadImage = await this.cloudinaryServices.uploadFile(
        product_image,
        `tenants/${tenant.id}/products/`,
      );
    }
    return productToDto(
      await this.prisma.$transaction(async (tx) => {
        // If new image uploaded, update or create asset
        if (uploadImage) {
          if (imageId) {
            // Update existing asset
            const asset = await tx.asset.update({
              where: { id: imageId },
              data: {
                fileName: product_image.originalname,
                url: uploadImage.secure_url,
                type: AssetType.PRODUCT_IMAGE,
                tenantId: String(tenant.id),
                fileSize: product_image.size,
                mimeType: product_image.mimetype,
              },
            });
            imageId = asset.id;
          } else {
            // Create new asset
            const asset = await tx.asset.create({
              data: {
                fileName: product_image.originalname,
                url: uploadImage.secure_url,
                type: AssetType.PRODUCT_IMAGE,
                tenantId: String(tenant.id),
                fileSize: product_image.size,
                mimeType: product_image.mimetype,
              },
            });
            imageId = asset.id;
          }
        }
        return tx.product.update({
          where: {
            id: String(product.id),
          },
          data: {
            ...data,
            featuredImageId: imageId,
            tenantId: String(tenant.id),
          },
        });
      }),
    );
  }
  async deleteProductByid(req, productId: string) {
    const product = await this.verifyProductOwnership(req, productId);
    // Delete associated asset if exists
    if (product.featuredImageId) {
      await this.prisma.asset.delete({
        where: { id: product.featuredImageId },
      });
    }
    await this.prisma.product.delete({
      where: {
        id: product.id.toString(),
      },
    });
  }
  async bulkImport(req, file: { file: Express.Multer.File }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        ownerId: String(req.user.id),
      },
    });
    if (!tenant) throw new ConflictException('Tenant not found');
    let data: any[] = [];
    const bulkFile = file.file;
    const ext = bulkFile.originalname.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      const parsed = Papa.parse(bulkFile.buffer.toString('utf-8'), {
        header: true,
        skipEmptyLines: true,
      });
      data = parsed.data as any[];
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = xlsx.read(bulkFile.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = xlsx.utils.sheet_to_json(sheet);
    } else {
      throw new Error('Unsupported format. Use CSV or Excel.');
    }
    const result: BulkImportResult = { success: 0, failed: 0, errors: [] };
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        if (!row.name || !row.price) {
          throw new Error('Missing required: name, price');
        }
        // Check slug uniqueness per tenant
        if (row.slug) {
          const existing = await this.prisma.product.findFirst({
            where: {
              slug: String(row.slug),
              tenantId: tenant.id,
            },
          });
          if (existing) {
            throw new Error('Duplicate slug for tenant');
          }
        }
        await this.prisma.product.create({
          data: {
            name: row.name,
            slug:
              row.slug ||
              row.name?.toString().toLowerCase().replace(/\s+/g, '-'),
            description: row.description || '',
            price: parseFloat(row.price),
            compareAtPrice: row.compareAtPrice
              ? parseFloat(row.compareAtPrice)
              : null,
            sku: row.sku || null,
            barcode: row.barcode || null,
            quantity: row.quantity ? parseInt(row.quantity) : 0,
            trackInventory:
              typeof row.trackInventory === 'boolean'
                ? row.trackInventory
                : String(row.trackInventory).toLowerCase() === 'true',
            status: row.status || 'ACTIVE',
            tenantId: tenant.id,
            weight: row.weight ? parseFloat(row.weight) : null,
            weightUnit: row.weightUnit || 'kg',
            taxable:
              typeof row.taxable === 'boolean'
                ? row.taxable
                : String(row.taxable).toLowerCase() === 'true',
            metaTitle: row.metaTitle || null,
            metaDescription: row.metaDescription || null,
            featured:
              typeof row.featured === 'boolean'
                ? row.featured
                : String(row.featured).toLowerCase() === 'true',
            featuredImageId: row.featuredImageId || null,
            createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
            updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
            publishedAt: row.publishedAt
              ? new Date(row.publishedAt)
              : undefined,
          },
        });
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          error: error.message,
          data: row,
        });
      }
    }
    return result;
  }
  async exportProducts(req: any, format: 'csv' | 'xlsx') {
    const tenant = await this.prisma.tenant.findUnique({
      where: { ownerId: String(req.user.id) },
    });
    if (!tenant) throw new ConflictException('Tenant not found');

    const products = await this.prisma.product.findMany({
      where: { tenantId: tenant.id },
    });

    // Export all fields for each product
    const exportData = products.map((p) => ({
      id: p.id,
      tenantId: p.tenantId,
      name: p.name,
      description: p.description,
      slug: p.slug,
      price: p.price?.toString(),
      compareAtPrice: p.compareAtPrice?.toString(),
      quantity: p.quantity,
      trackInventory: p.trackInventory,
      sku: p.sku,
      barcode: p.barcode,
      featuredImageId: p.featuredImageId,
      status: p.status,
      featured: p.featured,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      weight: p.weight?.toString(),
      weightUnit: p.weightUnit,
      taxable: p.taxable,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      publishedAt: p.publishedAt,
    }));

    if (format === 'csv') {
      const csv = Papa.unparse(exportData);
      return {
        buffer: Buffer.from(csv),
        filename: `products-${Date.now()}.csv`,
        mimeType: 'text/csv',
      };
    } else {
      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Products');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return {
        buffer: Buffer.from(buffer),
        filename: `products-${Date.now()}.xlsx`,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
  }
  async addVariant(
    req: any,
    productId: string,
    dto: backendDtos.CreateVariantDto,
  ) {
    // Verify ownership
    const product = await this.verifyProductOwnership(req, productId);

    // Create variant
    const variant = await this.prisma.productVariant.create({
      data: {
        productId: product.id,
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        quantity: dto.quantity || 0,
        option1Name: dto.option1Name,
        option1Value: dto.option1Value,
        option2Name: dto.option2Name,
        option2Value: dto.option2Value,
        option3Name: dto.option3Name,
        option3Value: dto.option3Value,
      },
    });

    return variant;
  }

  async updateVariant(
    req: any,
    productId: string,
    variantId: string,
    dto: backendDtos.UpdateVariantDto,
  ) {
    // Verify ownership
    await this.verifyProductOwnership(req, productId);

    // Verify variant belongs to product
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Update variant
    return await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        quantity: dto.quantity,
        option1Name: dto.option1Name,
        option1Value: dto.option1Value,
        option2Name: dto.option2Name,
        option2Value: dto.option2Value,
        option3Name: dto.option3Name,
        option3Value: dto.option3Value,
      },
    });
  }

  async deleteVariant(req: any, productId: string, variantId: string) {
    // Verify ownership
    await this.verifyProductOwnership(req, productId);

    // Verify variant exists
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Delete variant
    await this.prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  // ==========================================
  // INVENTORY MANAGEMENT
  // ==========================================

  async updateStock(
    req: any,
    productId: string,
    dto: backendDtos.UpdateStockDto,
  ) {
    // Verify ownership
    const product = await this.verifyProductOwnership(req, productId);

    if (dto.variantId) {
      // Update variant stock
      const variant = await this.prisma.productVariant.findFirst({
        where: { id: dto.variantId, productId },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      return await this.prisma.productVariant.update({
        where: { id: dto.variantId },
        data: {
          quantity:
            dto.action === 'set'
              ? dto.quantity
              : variant.quantity + dto.quantity,
        },
      });
    } else {
      // Update product stock
      return await this.prisma.product.update({
        where: { id: productId },
        data: {
          quantity:
            dto.action === 'set'
              ? dto.quantity
              : product.quantity + dto.quantity,
        },
      });
    }
  }

  async getLowStockProducts(req: any, threshold: number = 10) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { ownerId: String(req.user.id) },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Get products with low stock
    const products = await this.prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        quantity: {
          lte: threshold,
        },
        status: 'ACTIVE',
      },
      include: {
        variants: true,
      },
      orderBy: {
        quantity: 'asc',
      },
    });

    // Also check variants
    const productsWithLowVariants = await this.prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        variants: {
          some: {
            quantity: {
              lte: threshold,
            },
          },
        },
      },
      include: {
        variants: {
          where: {
            quantity: {
              lte: threshold,
            },
          },
        },
      },
    });

    // Combine results
    return {
      lowStockProducts: products,
      productsWithLowVariants,
      totalLowStock: products.length + productsWithLowVariants.length,
    };
  }
}

function productToDto(product: any) {
  if (!product) return product;
  return {
    ...product,
    price: product.price?.toString(),
    compareAtPrice: product.compareAtPrice?.toString(),
    weight: product.weight?.toString(),
    imageUrl: product.imageUrl || null,
  };
}
