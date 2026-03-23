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
  getCustomerOrdersById,
  exportCustomers,
  updateCustomer,
} from '#/lib/services/customer.services'
import { useCartStore } from '@/lib/stores/cart.store'
import type { paginationDto } from '@repo/shared'
import { useNavigate } from '@tanstack/react-router'

// Keep customer-related query keys centralized
const customerKeys = {
  all: ['customers'] as const,
  list: (params: { limit: number; offset: number }) =>
    ['customers', params] as const,
  detail: (customerId: string) => ['customer', customerId] as const,
  ordersById: (customerId: string) => ['customer-orders', customerId] as const,
}

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
    queryKey: customerKeys.list(params),
    queryFn: () => getAllCustomers({ data: params }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetCustomerOrdersById(
  customerId: string,
  params: { limit: number; offset: number } = { limit: 10, offset: 0 },
) {
  return useQuery({
    queryKey: [...customerKeys.ordersById(customerId), params],
    queryFn: () => getCustomerOrdersById({ data: { customerId, ...params } }),
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
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.removeQueries({
        queryKey: customerKeys.detail(variables.data.customerId),
      })
      queryClient.removeQueries({
        queryKey: customerKeys.ordersById(variables.data.customerId),
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
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success('Customer created successfully!')
    },
    onError: (err: Error) => {
      const message = err?.message || 'Failed to create customer'
      toast.error(message)
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  // const navigate = useNavigate()

  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: (_res, variables: { data: { customerId: string } }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.data.customerId),
      })
      queryClient.invalidateQueries({
        queryKey: customerKeys.ordersById(variables.data.customerId),
      })

      toast.success('Customer updated successfully')
      // navigate({ to: '/dashboard/customers' })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useExportAllCustomers() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'xlsx') => {
      const result = await exportCustomers({ data: { format } })
      if (!result?.base64) throw new Error('No data returned')

      const byteCharacters = atob(result.base64)
      const byteArray = new Uint8Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i)
      }

      const blob = new Blob([byteArray], { type: result.mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      link.click()
      URL.revokeObjectURL(url)

      toast.success(`Successfully exported customers in ${format}`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useGetCustomerById(customerId: string) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => getCustomerById({ data: { customerId } }),
    enabled: !!customerId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
