import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { useAppSession } from './session'

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// State for handling concurrent token refresh requests
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

// Process all queued requests after token refresh
const processQueue = (error: any = null, token: string = '') => {
  failedQueue.forEach((promise) => {
    error ? promise.reject(error) : promise.resolve(token)
  })
  failedQueue = []
}

// Redirect to login and clear session
const handleAuthFailure = async () => {
  const session = await useAppSession()
  await session.clear?.()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// Refresh access token using refresh token
const refreshAccessToken = async () => {
  const session = await useAppSession()

  if (!session.data.refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios
    .create()
    .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, null, {
      headers: {
        Cookie: `refreshToken=${session.data.refreshToken}`,
      },
    })

  const { accessToken, refreshToken } = response.data.data
  await session.update({ accessToken, refreshToken })

  return accessToken
}

// Handle 401 errors and retry with refreshed token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Queue request if refresh is already in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const newAccessToken = await refreshAccessToken()

      axiosInstance.defaults.headers.common['Authorization'] =
        `Bearer ${newAccessToken}`
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

      processQueue(null, newAccessToken)
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      await handleAuthFailure()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// API helper with automatic auth headers
export async function api<TResponse = any>(url: string, config: any = {}) {
  const session = await useAppSession()

  const headers = {
    'Content-Type': 'application/json',
    ...config.headers,
  }

  if (session.data.accessToken) {
    headers['Authorization'] = `Bearer ${session.data.accessToken}`
  }

  return axiosInstance.request<TResponse>({
    url,
    ...config,
    headers,
  })
}

export default axiosInstance
