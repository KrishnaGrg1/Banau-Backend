import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createWebsite,
  getWebsite,
  getWebsiteDetailsBySubdomain,
  publishWebsite,
} from '@/lib/services/website.service'
import { CreateWebsiteDto } from '@repo/shared'

export function useGetWebsite() {
  return useQuery({
    queryKey: ['website'],
    queryFn: getWebsite,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateWebsite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWebsiteDto) => {
      return createWebsite(data)
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['website'],
      })
    },
    onError(error) {
      console.log(error)
    },
  })
}

export function usePublishWebsite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      return publishWebsite()
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['website'],
      })
    },
  })
}

export function useGetWebsiteBySubdomain(subdomain?: string) {
  return useQuery({
    queryKey: ['website', 'subdomain', subdomain],
    queryFn: () => getWebsiteDetailsBySubdomain(subdomain!),
    enabled: !!subdomain,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
