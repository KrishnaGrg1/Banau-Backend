import {
  CreateUserDtoSchema,
  LoginDtoSchema,
  LoginResponse,
  RegisterResponse,
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

      return response.data
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { body?: { message?: string }; message?: string } }
      }
      const errorMessage =
        err.response?.data?.body?.message ||
        err.response?.data?.message ||
        'Failed to registered'
      throw new Error(errorMessage)
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
        token: response.data.data.token,
      })
      return response.data
    } catch (error: unknown) {
      console.log(error)
      const err = error as {
        response?: { data?: { body?: { message?: string }; message?: string } }
      }
      const errorMessage =
        err.response?.data?.body?.message ||
        err.response?.data?.message ||
        'Failed to login'
      throw new Error(errorMessage)
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
    const err = error as {
      response?: { data?: { body?: { message?: string }; message?: string } }
    }
    const errorMessage =
      err.response?.data?.body?.message ||
      err.response?.data?.message ||
      'Failed to logout'
    throw new Error(errorMessage)
  }
})
