import { useQuery } from '@tanstack/react-query'
import {
  getAdminAnalyticsOverview,
  getAdminFeatureFlags,
  getAdminGrowthMetrics,
  getAdminOverview,
  getAdminPlanManagement,
  getAdminRevenueMetrics,
  getAdminSystemSettings,
  getAdminTenantById,
  getAdminTenants,
  getAdminUserById,
  getAdminUserRoles,
  getAdminUsers,
} from '@/lib/services/admin.services'
import type { paginationDto } from '@repo/shared'

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getAdminOverview,
  })
}

export function useAdminAnalyticsOverview() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: getAdminAnalyticsOverview,
  })
}

export function useAdminGrowthMetrics() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'growth'],
    queryFn: getAdminGrowthMetrics,
  })
}

export function useAdminRevenueMetrics() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'revenue'],
    queryFn: getAdminRevenueMetrics,
  })
}

export function useAdminUsers(params: paginationDto = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => getAdminUsers({ data: params }),
  })
}

export function useAdminUserById(id?: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => getAdminUserById({ data: { id: id! } }),
    enabled: !!id,
  })
}

export function useAdminUserRoles() {
  return useQuery({
    queryKey: ['admin', 'users', 'roles'],
    queryFn: getAdminUserRoles,
  })
}

export function useAdminTenants(params: paginationDto = {}) {
  return useQuery({
    queryKey: ['admin', 'tenants', params],
    queryFn: () => getAdminTenants({ data: params }),
  })
}

export function useAdminTenantById(id?: string) {
  return useQuery({
    queryKey: ['admin', 'tenants', id],
    queryFn: () => getAdminTenantById({ data: { id: id! } }),
    enabled: !!id,
  })
}

export function useAdminFeatureFlags() {
  return useQuery({
    queryKey: ['admin', 'setting', 'features'],
    queryFn: getAdminFeatureFlags,
  })
}

export function useAdminPlanManagement() {
  return useQuery({
    queryKey: ['admin', 'setting', 'plans'],
    queryFn: getAdminPlanManagement,
  })
}

export function useAdminSystemSettings() {
  return useQuery({
    queryKey: ['admin', 'setting', 'system'],
    queryFn: getAdminSystemSettings,
  })
}
