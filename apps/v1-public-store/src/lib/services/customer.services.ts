import {
  CreateCustomerSchema,
  type CustomerListResponse,
  type CustomerOrdersById,
  type CustomerResponse,
  DeleteCustomerSchema,
  exportProductParamsSchema,
  getCustomerOrdersByIdSchema,
  LoginCustomerDtoSchema,
  type OrdersListResponse,
  paginationDtoSchema,
  RegisterCustomerDtoSchema,
  UpdateCustomerSchema,
} from '@repo/shared'
import axiosInstance  from '../axios'
import { createServerFn } from '@tanstack/react-start'
import { useAppSession } from '../session'
import { isAxiosError } from 'axios'

// Get my profile
export const getMyProfile = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await axiosInstance<any>('/customers/me', { method: 'GET' })
      return response.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to get profile')
    }
  },
)

// Update my profile
export const updateMyProfile = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as Record<string, any>)
  .handler(async ({ data }) => {
    try {
      const response = await axiosInstance<any>('/customers/me', {
        method: 'PUT',
        data,
      })
      return response.data
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to update profile')
    }
  })

// Customer login - calls /customers/login
export const customerLogin = createServerFn({ method: 'POST' })
  .inputValidator((data) => LoginCustomerDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await axiosInstance<any>('/customers/login', {
        data: data,
        method: 'POST',
      })
      // Store tokens in session
      const session = await useAppSession()
      await session.update({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[loginCustomer] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to login customer')
    }
  })

// Customer register - calls /customers/register
export const customerRegister = createServerFn({ method: 'POST' })
  .inputValidator((data) => RegisterCustomerDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await axiosInstance<any>('/customers/register', {
        data: data,
        method: 'POST',
      })
      // Store tokens in session after successful registration
      const session = await useAppSession()
      await session.update({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[loginCustomer] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to register')
    }
  })

// Customer logout
export const customerLogout = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const response = await axiosInstance('/customers/logout', {
        method: 'POST',
      })
      const session = await useAppSession()
      await session.clear()
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[logoutCustomer] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to logout')
    }
  },
)

export const getCustomerOrders = createServerFn({ method: 'GET' })
  .inputValidator((data) => paginationDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await axiosInstance<OrdersListResponse>('/customers/me/orders', {
        method: 'GET',
        params: data,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getMyOrders] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve your orders')
    }
  })

export const getAllCustomers = createServerFn({ method: 'GET' })
  .inputValidator((data) => paginationDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      console.log('input data', data)
      const response = await axiosInstance<CustomerListResponse>('/customers', {
        method: 'GET',
        params: data,
      })
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getMyCustomers] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve your customers')
    }
  })

export const getCustomerById = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => DeleteCustomerSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await axiosInstance<CustomerResponse>(
        `/customers/${data.customerId}`,
        {
          method: 'GET',
        },
      )
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getOrderById] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve customer')
    }
  })

export const deleteCustomerById = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => DeleteCustomerSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await axiosInstance(`/customers/${data.customerId}`, {
        method: 'DELETE',
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

export const createCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CreateCustomerSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await axiosInstance(`/customers`, {
        method: 'POST',
        data: data,
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


  export const exportCustomers=createServerFn({method:'POST'})
  .inputValidator((data:unknown)=>exportProductParamsSchema.parse(data))
   .handler(async ({ data }) => {
    try {
      const res = await axiosInstance('/customers/export', {
        method: 'GET',
        params: data,
        responseType: 'arraybuffer', // 👈 critical: get raw binary
      })

      if (res.status === 200) {
        const buffer = Buffer.from(res.data)
        const format = data.format ?? 'csv'
        const filename = `customers-${Date.now()}.${format}`
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
      throw new Error(err.message || 'Failed to export customers')
    }
  })



  export const getCustomerOrdersById = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => getCustomerOrdersByIdSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const {customerId,...paramsBody}=data
      const response = await axiosInstance<CustomerOrdersById>(
        `/customers/${data.customerId}/orders`,
        {
          method: 'GET',
          params: paramsBody,
        },
      )
      console.log("da",response.data)
      return response.data.data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(
          '[getOrderById] error:',
          JSON.stringify(error.response?.data, null, 2),
        )
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to retrieve customer')
    }
  })


  export const updateCustomer = createServerFn({ method: 'POST' })
  .inputValidator((data) => UpdateCustomerSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { customerId, ...bodyData } = data
      const response = await axiosInstance<CustomerResponse>(
        `/customers/${data.customerId}`,
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
