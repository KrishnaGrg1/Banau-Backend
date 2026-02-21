import {
  bulkImportProductsResponse,
  bulkImportSchema,
  CreateProductResponse,
  DeleteProductSchema,
  exportProductParamsSchema,
  getAllProductsResponse,
  paginationDtoSchema,
  UpdateProductInputSchema,
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

      if (data.product.product_image instanceof File) {
        const { buffer, mimeType } = base64ToBuffer(data.product.product_image)
        const blob = new Blob([buffer], { type: mimeType })

        formData.append('product_image', blob, data.product.product_image)
      }

      const response = await api<CreateProductResponse>(`/product/${data.id}`, {
        method: 'PUT',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data.data
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update product'
      throw new Error(errorMessage)
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
      // return data
    } catch (e: unknown) {
      const err = e as Error
      throw new Error(err.message || 'Failed to delete products')
    }
  })
