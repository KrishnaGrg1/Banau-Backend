import axios, { AxiosInstance } from 'axios'
import { useAuthStore } from './stores/auth.stores'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  // Get token from auth store
  const token = useAuthStore.getState().token
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const pathname = window.location.pathname
      
      // Don't logout on preview routes or public website endpoints
      const isPreviewRoute = pathname.startsWith('/preview/')
      const isPublicEndpoint = error.config?.url?.match(/^\/website\/[^/]+$/)
      
      // Only clear auth if we're on an authenticated route AND it's not a public endpoint
      const isAuthRoute = (pathname.startsWith('/dashboard') || pathname.startsWith('/website')) && !isPreviewRoute
      
      if (isAuthRoute && !isPublicEndpoint) {
        // Clear auth state and redirect to login
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
