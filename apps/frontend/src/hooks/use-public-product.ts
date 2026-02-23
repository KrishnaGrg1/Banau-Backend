import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPublicProducts,
  searchPublicProducts,
  getPublicProductBySlug,
} from '@/lib/services/public-product-services'


export function usePublicProducts(params: {
 subdomain: string
  page?: number
  limit?: number
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean  // ✅ boolean
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
}) {
  return useQuery({
    queryKey: ['publicProducts', params],
    queryFn: () => getPublicProducts({ data: params }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSearchProducts(params: {
  subdomain: string
  q: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['publicSearch', params],
    queryFn: () => searchPublicProducts({ data: params }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicProductBySlug(params: {
  subdomain: string
  slug: string
}) {
  return useQuery({
    queryKey: ['publicProduct', params.subdomain, params.slug],
    queryFn: () => getPublicProductBySlug({ data: params }),
    enabled: !!params.subdomain && !!params.slug,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
