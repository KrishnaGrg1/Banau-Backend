import {
  CreateProductDtoSchema,
  CreateProductResponse,
  getAllProductsResponse,
  paginationDtoSchema,
} from '@repo/shared'
import { createServerFn } from '@tanstack/react-start'
import { api } from '../axios'

export const createProduct = createServerFn({ method: 'POST' })
  .inputValidator((data) => CreateProductDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<CreateProductResponse>('/product', {
        data: data,
        method: 'POST',
      })
      console.log(response.data)
      return response.data
    } catch (error: unknown) {
      // The axios interceptor already extracts and wraps the error message
      const err = error as Error
      throw new Error(err.message || 'Failed to register')
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
      console.log("das",response.data.data)
      return response.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieved products')
    }
  })
