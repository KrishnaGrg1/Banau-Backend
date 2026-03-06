import {
  AcceptInviteDtoSchema,
  CreateTenantStaffDtoSchema,
  deleteStaffResponse,
  exportProductParamsSchema,
  getStaffByIdResponse,
  InviteStaffDtoSchema,
  paginationDtoSchema,
  StaffById,
  StaffListResponse,
  UpdateTenantStaffPermissionSchema,
} from '@repo/shared'
import { createServerFn } from '@tanstack/react-start'
import { api } from '../axios'
import { isAxiosError } from 'axios'

export const listAllStaff = createServerFn({ method: 'GET' })
  .inputValidator((data) => paginationDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      console.log('input data', data)
      const response = await api<StaffListResponse>('/staff-management', {
        method: 'GET',
        params: data,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[createCustomer] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
        throw new Error(
          error.response?.data.message || 'Failed to create customer',
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to create customer')
    }
  })

export const staffById = createServerFn({ method: 'GET' })
  .inputValidator((data) => StaffById.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<getStaffByIdResponse>(
        `/staff-management/${data.staffId}`,
        {
          method: 'GET',
        },
      )
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[createCustomer] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
        throw new Error(
          error.response?.data.message || 'Failed to create customer',
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to create customer')
    }
  })

export const deleteStaffById = createServerFn({ method: 'POST' })
  .inputValidator((data) => StaffById.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<deleteStaffResponse>(
        `/staff-management/${data.staffId}`,
        {
          method: 'DELETE',
        },
      )
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[createCustomer] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
        throw new Error(
          error.response?.data.message || 'Failed to create customer',
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to create customer')
    }
  })

export const exportStaffMembers = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => exportProductParamsSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const res = await api('/staff-management/export', {
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

export const createStaffMember = createServerFn({ method: 'POST' })
  .inputValidator((data) => CreateTenantStaffDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<getStaffByIdResponse>('/staff-management', {
        method: 'POST',
        data: data,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[deleteCustomer] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to delete customer')
    }
  })

export const updateStaffPermission = createServerFn({ method: 'POST' })
  .inputValidator((data) => UpdateTenantStaffPermissionSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { staffId, ...bodyData } = data
      const response = await api<getStaffByIdResponse>(
        `/staff-management/${data.staffId}`,
        {
          method: 'PUT',
          data: bodyData,
        },
      )
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[updateStaffPermission] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
        throw new Error(
          error.response?.data.message || 'Failed to update staff permission',
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to update staff permission')
    }
  })

export const inviteStaffMember = createServerFn({ method: 'POST' })
  .inputValidator((data) => InviteStaffDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<deleteStaffResponse>(
        '/staff-management/invite',
        {
          method: 'POST',
          data: data,
        },
      )
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[updateStaffPermission] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
        throw new Error(
          error.response?.data.message || 'Failed to update staff permission',
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to update staff permission')
    }
  })

export const acceptInvite = createServerFn({ method: 'POST' })
  .inputValidator((data) => AcceptInviteDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<getStaffByIdResponse>(
        '/staff-management/accept-invite',
        {
          method: 'POST',
          data: data,
        },
      )
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[updateStaffPermission] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
        throw new Error(
          error.response?.data.message || 'Failed to update staff permission',
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to update staff permission')
    }
  })
