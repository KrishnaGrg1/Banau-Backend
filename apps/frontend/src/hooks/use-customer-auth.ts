import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  customerLogin,
  customerRegister,
  customerLogout,
} from '@/lib/services/customer.services'
import { useCartStore } from '@/lib/stores/cart.store'

export function useCustomerLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: { email: string; password: string }
    }) => {
      return customerLogin({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] })
      toast.success('Login successful!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Login failed')
    },
  })
}

export function useCustomerRegister() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      return customerRegister({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] })
      toast.success('Registration successful!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Registration failed')
    },
  })
}

export function useCustomerLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clearCart = useCartStore((state) => state.clearCart)
  const setCustomerId = useCartStore((state) => state.setCustomerId)

  return useMutation({
    mutationFn: customerLogout,
    onSuccess: () => {
      queryClient.clear()
      clearCart()
      setCustomerId(null)
      toast.success('Logged out successfully')
    },
    onError: (error: Error) => {
      queryClient.clear()
      clearCart()
      setCustomerId(null)
      toast.error(error.message || 'Logout failed')
    },
  })
}
