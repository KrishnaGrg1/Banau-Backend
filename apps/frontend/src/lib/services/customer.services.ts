import { LoginCustomerDtoSchema, RegisterCustomerDtoSchema } from '@repo/shared'
import { api } from '../axios'
import { createServerFn } from '@tanstack/react-start'
import { useAppSession } from '../session'

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
      const err = error as Error
      throw new Error(err.message || 'Failed to login')
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
      const err = error as Error
      throw new Error(err.message || 'Failed to register')
    }
  })

// Customer logout
export const customerLogout = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const session = await useAppSession()
      await session.clear()
      return { success: true }
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(err.message || 'Failed to logout')
    }
  },
)
