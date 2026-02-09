import {
  CreateTenantDtoSchema,
  getTenantDetailsBySubdomainSchema,
  Tenant,
  TenantResponse,
} from '@repo/shared'
import { api } from '../axios'
import { createServerFn } from '@tanstack/react-start'

export const createTenant = createServerFn({ method: 'POST' })
  .inputValidator((data) => CreateTenantDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<TenantResponse>('/tenant', {
        data: data,
        method: 'POST',
      })
      console.log('lsdjf', response.data)
      return response.data.data
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { body?: { message?: string }; message?: string } }
      }
      const errorMessage =
        err.response?.data?.body?.message ||
        err.response?.data?.message ||
        'Failed to process tenant request'
      throw new Error(errorMessage)
    }
  })

export const publishTenant = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const response = await api<TenantResponse>('/tenant/publish', {
        method: 'PUT',
      })
      return response.data
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { body?: { message?: string }; message?: string } }
      }
      const errorMessage =
        err.response?.data?.body?.message ||
        err.response?.data?.message ||
        'Failed to process tenant request'
      throw new Error(errorMessage)
    }
  },
)

export const getTenant = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const response = await api<TenantResponse>('/tenant', {
      method: 'GET',
    })
    console.log('GEt tenatn', response.data.data)
    return response.data.data
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { body?: { message?: string }; message?: string } }
    }
    const errorMessage =
      err.response?.data?.body?.message ||
      err.response?.data?.message ||
      'Failed to process tenant request'
    throw new Error(errorMessage)
  }
})

export const getTenantDetailsBySubdomain = createServerFn({ method: 'GET' })
  .inputValidator((input) => getTenantDetailsBySubdomainSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const response = await api<{ data: Tenant }>(
        `/tenant/${data.subdomain}`,
        {
          method: 'GET',
        },
      )
      console.log('subdomain', response.data.data)
      return response.data.data
    } catch (err: unknown) {
      const error = err as any
      const message =
        error.response?.data?.body?.message ||
        error.response?.data?.message ||
        'Failed to fetch tenant'
      throw new Error(message)
    }
  })
