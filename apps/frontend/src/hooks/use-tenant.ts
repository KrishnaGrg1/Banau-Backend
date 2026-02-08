import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createTenant,
  getTenant,
  getTenantDetailsBySubdomain,
  publishTenant,
} from '@/lib/services/tenant.service'
import { toast } from 'sonner'

export function useGetTenant() {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: getTenant,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTenant,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['tenant'],
      })
      toast.success('Tenant created successfully')
    },
    onError(error) {
      console.log(error)
    },
  })
}

export function usePublishTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      return publishTenant()
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['tenant'],
      })
      toast.success('Tenant published successfully')
    },
  })
}

export function useGetTenantBySubdomain(subdomain?: string) {
  return useQuery({
    queryKey: ['tenant', 'subdomain', subdomain],
    queryFn: () => getTenantDetailsBySubdomain({data:subdomain}),
    enabled: !!subdomain,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
