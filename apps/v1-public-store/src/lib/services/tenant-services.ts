import { getTenantDetailsBySubdomainSchema } from '@repo/shared'

import { createServerFn } from '@tanstack/react-start'
import type { Tenant, Asset, Setting } from '@repo/db/dist/generated/prisma/client'
import axiosInstance from '../axios'

export const getTenantDetailsBySubdomain = createServerFn({ method: 'GET' })
  .inputValidator((input) => getTenantDetailsBySubdomainSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const response = await axiosInstance<{
        data: {
          existingTenant: Tenant
          existingSetting: Setting
          logo: Asset
          favicon: Asset
        }
      }>(`/tenant/${data.subdomain}`, {
        method: 'GET',
      })
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
