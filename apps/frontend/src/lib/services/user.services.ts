import { getMeResponse } from '@repo/shared'
import { api } from '../axios'
import { createServerFn } from '@tanstack/react-start'

export const getMe = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const response = await api<getMeResponse>('/user/me', {
      method: 'GET',
    })
    console.log('Get me ', response.data)
    return response.data
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { body?: { message?: string }; message?: string } }
    }
    const errorMessage =
      err.response?.data?.body?.message ||
      err.response?.data?.message ||
      'Failed to fetch communities'
    throw new Error(errorMessage)
  }
})
