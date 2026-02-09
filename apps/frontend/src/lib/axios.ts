// apps/web/app/lib/axios.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAppSession } from './session'
import { refreshTokenResponse } from '@repo/shared'

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request logging
axiosInstance.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AXIOS] ${config.method?.toUpperCase()} ${config.url}`)
  }
  return config
})

// Response logging
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AXIOS] Response Error:', err.response?.data)
    }
    return Promise.reject(err)
  }
)

// Typed API helper (server-side)
export async function api<TResponse = any>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<TResponse>> {
  const session = await useAppSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string>),
  }

  if (session.data.accessToken) {
    headers['Authorization'] = `Bearer ${session.data.accessToken}`
  }

  const requestConfig: AxiosRequestConfig = {
    url,
    ...config,
    headers,
  }

  if (config.method?.toUpperCase() === 'GET') {
    delete requestConfig.data
  }

  try {
    return await axiosInstance.request<TResponse>(requestConfig)
  } catch (err: any) {
    // Only attempt refresh if 401
    if (err.response?.status === 401 && session.data.refreshToken) {
      try {
        // Use bare Axios for refresh call (no interceptors)
        const refreshRes = await axios.post<refreshTokenResponse>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          null,
          {
            headers: { Authorization: `Bearer ${session.data.refreshToken}` },
            withCredentials: true,
          }
        )

        const { accessToken, refreshToken } = refreshRes.data.data
        session.update({ accessToken, refreshToken })

        // Retry original request with new access token
        return await axiosInstance.request<TResponse>({
          ...requestConfig,
          headers: {
            ...requestConfig.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } catch (refreshErr: any) {
        session.clear?.()
        throw refreshErr
      }
    }

    throw err
  }
}

export default axiosInstance
