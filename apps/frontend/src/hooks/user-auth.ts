import { login, logout, register } from '@/lib/services/auth.services'
// import { useAuthStore } from '@/lib/stores/auth.stores'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  // const { setUser, setAuthSession, setAuthenticated } = useAuthStore()
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      // setUser(data.data.user)
      // setAuthSession(data.data.token)
      // setAuthenticated(true)
      navigate({ to: '/dashboard' })
      toast.success('Login successfully ')
    },
    onError: (err: Error) => {
      console.log('Login error', err)
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate({ to: '/login' })
      toast.success('Register successfully ')
    },
    onError: (err: Error) => {
      console.log('Register Error', err.message)
    },
  })
}

export function useLogOut() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  // const { logout: loggingOutStore } = useAuthStore()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries first
      queryClient.clear()
      // loggingOutStore()
      toast.success('Logout successfully')
      // Navigate to login immediately
      navigate({ to: '/login', replace: true })
    },
    onError: (error: Error) => {
      // Even on error, clear session and redirect
      queryClient.clear()
      toast.error(error.message || 'Logout failed')
      navigate({ to: '/login', replace: true })
    },
  })
}
