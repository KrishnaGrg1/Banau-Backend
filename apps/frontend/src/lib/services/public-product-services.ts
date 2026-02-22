import { ProductDto, ProductVariantDto } from '@repo/shared'
import { createServerFn } from '@tanstack/react-start'
import { api } from '../axios'
import { isAxiosError } from 'axios'
import { z } from 'zod'

// ==================== Schemas ====================

export const publicProductsListSchema = z.object({
  subdomain: z.string().min(1),
  page: z.number().positive().optional().default(1),
  limit: z.number().positive().optional().default(10),
  category: z.string().optional(),
  status: z.string().optional(),
})

export const publicProductsSearchSchema = z.object({
  subdomain: z.string().min(1),
  q: z.string().min(1),
  page: z.number().positive().optional().default(1),
  limit: z.number().positive().optional().default(20),
})

export const publicProductBySlugSchema = z.object({
  subdomain: z.string().min(1),
  slug: z.string().min(1),
})

// ==================== Types ====================

interface PublicProductsResponseData {
  products: ProductDto[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface PublicProductSearchResponseData {
  products: ProductDto[]
  query: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ==================== API Functions ====================

/**
 * Fetch public products for a given store (tenant) by subdomain.
 * Only ACTIVE products are returned.
 */
export const getPublicProducts = createServerFn({ method: 'GET' })
  .inputValidator((data) => publicProductsListSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        message: string
        data: PublicProductsResponseData
        timestamp: string
      }>(`/public/${data.subdomain}/products`, {
        method: 'GET',
        params: {
          category: data.category,
          status: data.status,
          page: data.page,
          limit: data.limit,
        },
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getPublicProducts] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to fetch products')
    }
  })

/**
 * Search public products by name, description, or SKU.
 */
export const searchPublicProducts = createServerFn({ method: 'GET' })
  .inputValidator((data) => publicProductsSearchSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        message: string
        data: PublicProductSearchResponseData
        timestamp: string
      }>(`/public/${data.subdomain}/products/search`, {
        method: 'GET',
        params: {
          q: data.q,
          page: data.page,
          limit: data.limit,
        },
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[searchPublicProducts] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to search products')
    }
  })

/**
 * Fetch a single product by its slug for a given subdomain.
 */
export const getPublicProductBySlug = createServerFn({ method: 'GET' })
  .inputValidator((data) => publicProductBySlugSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<{
        success: boolean
        message: string
        data: ProductDto
        timestamp: string
      }>(`/public/${data.subdomain}/products/${data.slug}`, {
        method: 'GET',
      })
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getPublicProductBySlug] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to fetch product')
    }
  })
