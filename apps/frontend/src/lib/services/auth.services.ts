import { CreateUserDto, LoginDto, LoginResponse, RegisterResponse } from '@repo/shared'
import axiosInstance from '../axios'

export const register = async (data: CreateUserDto) => {
  try {
    const response = await axiosInstance.post<RegisterResponse>('/auth/register', data)
    return response.data
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { body?: { message?: string }; message?: string } }
    }
    const errorMessage =
      err.response?.data?.body?.message ||
      err.response?.data?.message
    throw new Error(errorMessage)
  }
}


export const login = async (data: LoginDto) => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', data)
    return response.data
  } catch (error: unknown) {
    console.log(error)
    const err = error as {
      response?: { data?: { body?: { message?: string }; message?: string } }
    }
    const errorMessage =
      err.response?.data?.body?.message ||
      err.response?.data?.message 
    throw new Error(errorMessage)
  }
}


export const logout = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout')
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
}