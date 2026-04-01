import { createServerFn } from '@tanstack/react-start'
import { api } from '../axios'
import { paginationDtoSchema } from '@repo/shared'
import { z } from 'zod'

const idInputSchema = z.object({
  id: z.string().min(1),
})

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as {
    response?: { data?: { body?: { message?: string }; message?: string } }
    message?: string
  }

  return (
    err.response?.data?.body?.message ||
    err.response?.data?.message ||
    err.message ||
    fallback
  )
}

export const getAdminOverview = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api('/admin', { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch admin overview'))
    }
  },
)

export const getAdminAnalyticsOverview = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api('/admin/analytics', { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error, 'Failed to fetch analytics overview'),
      )
    }
  },
)

export const getAdminGrowthMetrics = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api('/admin/analytics/growth', { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch growth metrics'))
    }
  },
)

export const getAdminRevenueMetrics = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api('/admin/analytics/revenue', { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch revenue metrics'))
    }
  },
)

export const getAdminUsers = createServerFn({ method: 'GET' })
  .inputValidator((data) => paginationDtoSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    try {
      const params = new URLSearchParams()
      if (data?.limit) params.set('limit', String(data.limit))
      if (data?.offset !== undefined) params.set('offset', String(data.offset))
      if (data?.role) params.set('role', data.role)

      const queryString = params.toString()
      const response = await api(`/admin/users${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
      })

      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch users'))
    }
  })

export const getAdminUserById = createServerFn({ method: 'GET' })
  .inputValidator((data) => idInputSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api(`/admin/users/${data.id}`, { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch user detail'))
    }
  })

export const getAdminUserRoles = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api('/admin/users/roles', { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch user roles'))
    }
  },
)

export const getAdminTenants = createServerFn({ method: 'GET' })
  .inputValidator((data) => paginationDtoSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    try {
      const params = new URLSearchParams()
      if (data?.limit) params.set('limit', String(data.limit))
      if (data?.offset !== undefined) params.set('offset', String(data.offset))

      const queryString = params.toString()
      const response = await api(
        `/admin/tenants${queryString ? `?${queryString}` : ''}`,
        {
          method: 'GET',
        },
      )

      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch tenants'))
    }
  })

export const getAdminTenantById = createServerFn({ method: 'GET' })
  .inputValidator((data) => idInputSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api(`/admin/tenants/${data.id}`, { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch tenant detail'))
    }
  })

export const getAdminFeatureFlags = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api('/admin/setting/features', { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch feature flags'))
    }
  },
)

export const getAdminPlanManagement = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api('/admin/setting/plans', { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch plans'))
    }
  },
)

export const getAdminSystemSettings = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api('/admin/setting/system', { method: 'GET' })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error, 'Failed to fetch system settings'),
      )
    }
  },
)
