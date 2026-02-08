// apps/web/app/lib/axios.ts
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios'
import { useAppSession } from './session'

// ============================================
// CREATE AXIOS INSTANCE
// ============================================
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// ============================================
// REQUEST INTERCEPTOR
// ============================================
axiosInstance.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AXIOS] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[AXIOS] Request Error:', error)
    return Promise.reject(error)
  },
)

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[AXIOS] Response Error:', error.response?.data)
    }

    // Extract error message
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  },
)

// ============================================
// TYPED API HELPER (for Server Functions)
// ============================================
export async function api<TResponse = any>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<TResponse>> {
  // Get session and add authorization token if available
  const session = await useAppSession()

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string>),
  }

  // Add Authorization header only if token exists
  if (session.data.token) {
    headers['Authorization'] = `Bearer ${session.data.token}`
  }

  // Build request config
  const requestConfig: AxiosRequestConfig = {
    url,
    ...config,
    headers,
  }

  // Remove data from GET requests to avoid sending body
  if (config.method?.toUpperCase() === 'GET') {
    delete requestConfig.data
  }

  // Make request
  return axiosInstance.request<TResponse>(requestConfig)
}

export default axiosInstance
