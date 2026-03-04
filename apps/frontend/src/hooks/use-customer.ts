import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  customerLogin,
  customerRegister,
  customerLogout,
  getMyProfile,
  updateMyProfile,
  getCustomerOrders,
  getAllCustomers,
  getCustomerById,
  deleteCustomerById,
  createCustomer,
} from '@/lib/services/customer.services'
import { useCartStore } from '@/lib/stores/cart.store'
import { paginationDto } from '@repo/shared'

export function useCustomerLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: { email: string; password: string }
    }) => {
      return customerLogin({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Login successful!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Login failed')
    },
  })
}

export function useCustomerRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      return customerRegister({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Registration successful!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Registration failed')
    },
  })
}

export function useCustomerLogout() {
  const queryClient = useQueryClient()
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

export function useMyProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfile(),
    retry: false,
  })
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Record<string, any>) => updateMyProfile({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

export function useCustomerOrders(params: paginationDto = {}) {
  return useQuery({
    queryKey: ['my-orders', params],
    queryFn: () => getCustomerOrders({ data: params }),
    select: (data) => data, // Return full response with data.orders structure
  })
}

export function useListAllCustomers(params: { limit: number; offset: number }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => getAllCustomers({ data: params }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetCustomerById(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomerById({ data: { customerId } }),
    enabled: !!customerId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data }: { data: { customerId: string } }) =>
      deleteCustomerById({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.removeQueries({
        queryKey: ['customer', variables.data.customerId],
      })
      toast.success('Customer deleted successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
      console.error('[DELETE] Error:', err)
    },
  })
}
export function useCustomerCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      return createCustomer({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer created successfully!')
    },
    onError: (err: Error) => {
      const message =
        err?.message ||
        'Failed to create customer'
      toast.error(message)
    },
  })
}