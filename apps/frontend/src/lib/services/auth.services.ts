import {
  CreateUserDtoSchema,
  LoginDtoSchema,
  LoginResponse,
  refreshTokenResponse,
  RegisterResponse,
  VerifyUserSchema,
} from '@repo/shared'
import { api } from '../axios'
import { createServerFn } from '@tanstack/react-start'
import { useAppSession } from '../session'

export const register = createServerFn({ method: 'POST' })
  .inputValidator((data) => CreateUserDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<RegisterResponse>('/auth/register', {
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

export const login = createServerFn({ method: 'POST' })
  .inputValidator((data) => LoginDtoSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<LoginResponse>('/auth/login', {
        data: data,
        method: 'POST',
      })
      const session = await useAppSession()
      await session.update({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      })
      return response.data
    } catch (error: unknown) {
      console.log(error)
      // The axios interceptor already extracts and wraps the error message
      const err = error as Error
      throw new Error(err.message || 'Failed to login')
    }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const response = await api('/auth/logout', {
      method: 'POST',
    })
    const session = await useAppSession()
    await session.clear()

    return response.data
  } catch (error: unknown) {
    console.log(error)
    // The axios interceptor already extracts and wraps the error message
    const err = error as Error
    throw new Error(err.message || 'Failed to Logout')
  }
})

export const verify = createServerFn({ method: 'POST' })
  .inputValidator((data) => VerifyUserSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await api<LoginResponse>('/auth/verify', {
        data: data,
        method: 'PUT',
      })
      return response.data
    } catch (error: unknown) {
      console.log(error)
      // The axios interceptor already extracts and wraps the error message
      const err = error as Error
      throw new Error(err.message || 'Failed to login')
    }
  })

export const refreshToken = createServerFn({ method: 'POST' }).handler(
  async () => {
    try {
      const response = await api<refreshTokenResponse>('/auth/refresh', {
        method: 'POST',
      })
      const session = await useAppSession()
      await session.update({
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      })
      return response.data
    } catch (error: unknown) {
      // If refresh fails, clear session
      const session = await useAppSession()
      await session.clear()
      const err = error as Error
      throw new Error(err.message || 'Failed to refresh token')
    }
  },
)
