import { login, logout, register } from '@/lib/services/auth.services'
import { useAuthStore } from '@/lib/stores/auth.stores'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setUser, setAuthSession, setAuthenticated } = useAuthStore()
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      setUser(data.data.user)
      setAuthSession(data.data.token)
      setAuthenticated(true)
      navigate({ to: '/dashboard' })
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
    },
    onError: (err: Error) => {
      console.log('Register Error', err.message)
    },
  })
}

export function useLogOut() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { logout: loggingOutStore } = useAuthStore()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      loggingOutStore()
      navigate({ to: '/login' })
    },
  })
}
