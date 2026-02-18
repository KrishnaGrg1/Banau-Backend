// apps/web/app/hooks/use-setting.ts
import {
  createTenantSetting,
  getTenantSetting,
  getTenantSettingAssets,
  updateTenantSetting,
} from '@/lib/services/setting.services'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Fetch tenant settings
export function useTenantSetting() {
  return useQuery({
    queryKey: ['tenant-settings'],
    queryFn: getTenantSetting,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch tenant assets (logo/favicon)
export function usegetTenantSettingAsset() {
  return useQuery({
    queryKey: ['tenant-assets'],
    queryFn: getTenantSettingAssets,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

// Create tenant setting
export function useCreateTenantSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      return await createTenantSetting({ data })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-assets'] })
      toast.success('Settings created successfully')
    },
    onError(error: any) {
      console.error('[CREATE] Error:', error)
      toast.error(error.message || 'Failed to create settings')
    },
  })
}

// Update tenant setting
export function useUpdateTenantSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      return await updateTenantSetting({ data })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-assets'] })
      toast.success('Settings updated successfully')
    },
    onError(error: any) {
      console.error('[UPDATE] Error:', error)
      toast.error(error.message || 'Failed to update settings')
    },
  })
}

// ✅ Smart hook that decides create vs update
export function useSaveTenantSetting() {
  const createMutation = useCreateTenantSetting()
  const updateMutation = useUpdateTenantSetting()
  const { data: existingSettings } = useTenantSetting()

  return {
    mutateAsync: async (params: { data: any }) => {
      console.log('[SAVE] Existing settings?', !!existingSettings)
      
      // If settings exist, update. Otherwise, create.
      if (existingSettings) {
        console.log('[SAVE] Updating existing settings')
        return updateMutation.mutateAsync(params)
      } else {
        console.log('[SAVE] Creating new settings')
        return createMutation.mutateAsync(params)
      }
    },
    isPending: createMutation.isPending || updateMutation.isPending,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
    isError: createMutation.isError || updateMutation.isError,
    error: createMutation.error || updateMutation.error,
  }
}