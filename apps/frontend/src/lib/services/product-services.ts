import {
  bulkImportProductsResponse,
  bulkImportSchema,
  CreateProductResponse,
  CreateVariantDtoSchema,
  DeleteProductSchema,
  exportProductParamsSchema,
  getAllProductsResponse,
  paginationDtoSchema,
  ProductDto,
  ProductVariantDto,
  UpdateProductInputSchema,
  UpdateStockDtoSchema,
  UpdateVariantDtoSchema,
} from '@repo/shared'
import { createServerFn } from '@tanstack/react-start'
import { api } from '../axios'
import { base64ToBuffer } from './setting.services'
import { isAxiosError } from 'axios'
export const createProduct = createServerFn({ method: 'POST' }).handler(
  async ({ data }: { data: any }) => {
    try {
      const formData = new FormData()
      console.log('images ', data.product_image)
      // ✅ Append all text fields
      const textFields = [
        'name',
        'description',
        'slug',
        'price',
        'compareAtPrice',
        'quantity',
        'trackInventory',
        'sku',
        'barcode',
        'status',
        'featured',
        'metaTitle',
        'metaDescription',
        'weight',
        'weightUnit',
        'taxable',
      ]
      textFields.forEach((field) => {
        const value = data[field]
        if (value !== undefined && value !== null && value !== '') {
          formData.append(field, String(value))
        }
      })
      // Handle product_image as File or base64 string
      if (data.product_image instanceof File) {
        formData.append(
          'product_image',
          data.product_image,
          data.productImageName || data.product_image.name,
        )
      } else if (
        data.product_image &&
        typeof data.product_image === 'string' &&
        data.product_image !== ''
      ) {
        const { buffer, mimeType } = base64ToBuffer(data.product_image)
        const blob = new Blob([buffer], { type: mimeType })
        formData.append(
          'product_image',
          blob,
          data.productImageName || 'product_image',
        )
      }
      const response = await api<CreateProductResponse>('/product', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log(response.data)
      return response.data
    } catch (error: unknown) {
      // ⬇ This logs the exact NestJS validation error array — check your server console
      if (isAxiosError(error)) {
        console.error(
          '[createProduct] validation errors:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to create product')
    }
  },
)

export const getAllProducts = createServerFn({ method: 'GET' })
  .inputValidator((data) => paginationDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<getAllProductsResponse>('/product', {
        method: 'GET',
        params: data,
      })
      console.log('das', response.data.data)
      return response.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieved products')
    }
  })

export const getProductById = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    const productId = (data as { productId: string }).productId
    if (!productId || typeof productId !== 'string') {
      throw new Error('Product ID is required')
    }
    return { productId }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        message: string
        data: ProductDto
        timestamp: string
      }>(`/product/${data.productId}`, {
        method: 'GET',
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getProductById] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve product')
    }
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateProductInputSchema.parse(data))
  .handler(async ({ data }: { data: any }) => {
    try {
      const formData = new FormData()

      const textFields = [
        'name',
        'description',
        'slug',
        'price',
        'compareAtPrice',
        'quantity',
        'trackInventory',
        'sku',
        'barcode',
        'status',
        'featured',
        'metaTitle',
        'metaDescription',
        'weight',
        'weightUnit',
        'taxable',
      ] as const

      textFields.forEach((field) => {
        const value = data.product[field]
        if (value !== undefined && value !== null && value !== '') {
          formData.append(field, String(value))
        }
      })

      // Handle product_image as base64 string (same pattern as createProduct)
      const productImage = data.product.product_image
      const productImageName = data.product.productImageName

      console.log('updateProduct - product_image:', productImage ? 'present' : 'not present')
      console.log('updateProduct - productImageName:', productImageName)

 if (
  productImage &&
  typeof productImage === 'string' &&
  productImage !== ''
) {
  // ✅ Only process as base64 if it's actually base64, not a URL
  if (productImage.startsWith('data:')) {
    const { buffer, mimeType } = base64ToBuffer(productImage)
    const blob = new Blob([buffer], { type: mimeType })
    formData.append(
      'product_image',
      blob,
      productImageName || 'product_image',
    )
    console.log('updateProduct - new image added to formData')
  } else {
    console.log('updateProduct - existing URL, skipping image upload')
    // Don't append anything — backend keeps the existing image
  }
}

      const response = await api<CreateProductResponse>(`/product/${data.id}`, {
        method: 'PUT',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[updateProduct] validation errors:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to update product')
    }
  })

export const exportProducts = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => exportProductParamsSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const res = await api('/product/export', {
        method: 'GET',
        params: data,
        responseType: 'arraybuffer', // 👈 critical: get raw binary
      })

      if (res.status === 200) {
        const buffer = Buffer.from(res.data)
        const format = data.format ?? 'csv'
        const filename = `products-${Date.now()}.${format}`
        const mimeType =
          format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv'

        return {
          success: true,
          base64: buffer.toString('base64'), // 👈 serialize binary as base64
          filename,
          mimeType,
        }
      }
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'Failed to export products')
    }
  })

export const bulkImportProducts = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => bulkImportSchema.parse(data))
  .handler(async ({ data }: { data: any }) => {
    try {
      const form = new FormData()
      const { buffer, mimeType } = base64ToBuffer(data.file)
      const blob = new Blob([buffer], { type: mimeType })
      form.append('file', blob, data.filename)
      const res = await api<bulkImportProductsResponse>('/product/bulk', {
        method: 'POST',
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'Failed to bulk import products')
    }
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => DeleteProductSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api(`/product/${data.productId}`, {
        method: 'DELETE',
      })
      return response.data
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'Failed to delete products')
    }
  })

// ==================== Low Stock Products ====================
export const getLowStockProducts = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    const threshold = (data as { threshold?: number }).threshold ?? 10
    return { threshold }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        message: string
        data: ProductDto[]
        timestamp: string
      }>('/product/low-stock', {
        method: 'GET',
        params: { threshold: data.threshold },
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getLowStockProducts] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve low stock products')
    }
  })

// ==================== Product Variants ====================
export const addVariant = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const { productId, variant } = data as {
      productId: string
      variant: unknown
    }
    if (!productId) throw new Error('Product ID is required')
    return { productId, variant: CreateVariantDtoSchema.parse(variant) }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        message: string
        data: ProductVariantDto
        timestamp: string
      }>(`/product/${data.productId}/variants`, {
        method: 'POST',
        data: data.variant,
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[addVariant] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to add variant')
    }
  })

export const updateVariant = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const { productId, variantId, variant } = data as {
      productId: string
      variantId: string
      variant: unknown
    }
    if (!productId) throw new Error('Product ID is required')
    if (!variantId) throw new Error('Variant ID is required')
    return {
      productId,
      variantId,
      variant: UpdateVariantDtoSchema.parse(variant),
    }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        message: string
        data: ProductVariantDto
        timestamp: string
      }>(`/product/${data.productId}/variants/${data.variantId}`, {
        method: 'PUT',
        data: data.variant,
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[updateVariant] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to update variant')
    }
  })

export const deleteVariant = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const { productId, variantId } = data as {
      productId: string
      variantId: string
    }
    if (!productId) throw new Error('Product ID is required')
    if (!variantId) throw new Error('Variant ID is required')
    return { productId, variantId }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api(
        `/product/${data.productId}/variants/${data.variantId}`,
        {
          method: 'DELETE',
        },
      )
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[deleteVariant] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to delete variant')
    }
  })

// ==================== Stock Management ====================
export const updateStock = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const { productId, stock } = data as {
      productId: string
      stock: unknown
    }
    if (!productId) throw new Error('Product ID is required')
    return { productId, stock: UpdateStockDtoSchema.parse(stock) }
  })
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        message: string
        data: ProductDto
        timestamp: string
      }>(`/product/${data.productId}/stock`, {
        method: 'PUT',
        data: data.stock,
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[updateStock] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to update stock')
    }
  })
