import {
  CreateProductDtoSchema,
  CreateProductResponse,
  getAllProductsResponse,
  paginationDtoSchema,
  UpdateProductInputSchema,
} from '@repo/shared'
import { createServerFn } from '@tanstack/react-start'
import { api } from '../axios'
import { base64ToBuffer } from './setting.services'
export const createProduct = createServerFn({ method: 'POST' })
  .inputValidator((data) => CreateProductDtoSchema.parse(data))
  .handler(async ({ data }: { data: any }) => {
    try {
      const formData = new FormData()

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
      if (data.product_image instanceof File) {
        const { buffer, mimeType } = base64ToBuffer(data.product_image)
        const blob = new Blob([buffer], { type: mimeType })
        formData.append('product_image', blob, data.productImageName)
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
      const err = error as Error
      throw new Error(err.message || 'Failed to create product')
    }
  })

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
