import {
  CreateCustomerSchema,
  CustomerListResponse,
  CustomerResponse,
  DeleteCustomerSchema,
  LoginCustomerDtoSchema,
  OrdersListResponse,
  paginationDtoSchema,
  RegisterCustomerDtoSchema,
} from '@repo/shared'
import { api } from '../axios'
import { createServerFn } from '@tanstack/react-start'
import { useAppSession } from '../session'
import { isAxiosError } from 'axios'

// Get my profile
export const getMyProfile = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api<any>('/customers/me', { method: 'GET' })
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
      const response = await api<any>('/customers/me', {
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
      const response = await api<any>('/customers/login', {
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
      const response = await api<any>('/customers/register', {
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
      const response = await api('/customers/logout', {
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
      const response = await api<OrdersListResponse>('/customers/me/orders', {
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
      const response = await api<CustomerListResponse>('/customers', {
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
      const response = await api<CustomerResponse>(
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
      const response = await api(`/customers/${data.customerId}`, {
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
      const response = await api(`/customers`, {
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
      }
      const err = error as Error
      throw new Error(err.message || 'Failed to create customer')
    }
  })
