import  { CreateWebsiteDto, WebsiteResponse } from "@repo/shared"
import axiosInstance from "../axios"

export const createWebsite = async (data: CreateWebsiteDto) => {
  try {
    const response = await axiosInstance.post<WebsiteResponse>('/website', data)
    return response.data.data 
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


export const publilshWebsite = async () => {
  try {
    const response = await axiosInstance.put<WebsiteResponse>('/website/publish')
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


export const getWebsite = async () => {
  try {
    const response = await axiosInstance.get<WebsiteResponse>('/website')
    return response.data.data
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