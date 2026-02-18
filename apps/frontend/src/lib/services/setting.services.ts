// apps/web/app/lib/services/setting.services.ts
import {
  CreateTenantSettingDtoSchema,
  TenantSettingAssetsResponse,
  TenantSettingResponse,
} from '@repo/shared'
import { api } from '../axios'
import { createServerFn } from '@tanstack/react-start'

// ✅ Create tenant setting (accepts raw data, not validated yet)
export const createTenantSetting = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: any }) => {
    try {
      // ✅ Build FormData
      const formData = new FormData()

      // Append all text fields
      formData.append('primaryColorCode', data.primaryColorCode)
      formData.append('secondaryColorCode', data.secondaryColorCode)
      formData.append('primaryTextColorCode', data.primaryTextColorCode)
      formData.append('secondaryTextColorCode', data.secondaryTextColorCode)
      formData.append('backgroundColorCode', data.backgroundColorCode)
      formData.append('backgroundTextColorCode', data.backgroundTextColorCode)
      formData.append('landingPageTitle', data.landingPageTitle)
      formData.append('landingPageDescription', data.landingPageDescription)

      // Append files if present
      if (data.logo instanceof File) {
        formData.append('logo', data.logo)
      }
      if (data.favicon instanceof File) {
        formData.append('favicon', data.favicon)
      }

      console.log('[CREATE] Sending FormData to /tenant/setting')

      const response = await api<TenantSettingResponse>('/tenant/setting', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('[CREATE] Success:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('[CREATE] Error:', error.response?.data || error.message)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create tenant settings'
      throw new Error(errorMessage)
    }
  })

// ✅ Update tenant setting
export const updateTenantSetting = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: any }) => {
    try {
      // ✅ Build FormData
      const formData = new FormData()

      // Append all text fields
      formData.append('primaryColorCode', data.primaryColorCode)
      formData.append('secondaryColorCode', data.secondaryColorCode)
      formData.append('primaryTextColorCode', data.primaryTextColorCode)
      formData.append('secondaryTextColorCode', data.secondaryTextColorCode)
      formData.append('backgroundColorCode', data.backgroundColorCode)
      formData.append('backgroundTextColorCode', data.backgroundTextColorCode)
      formData.append('landingPageTitle', data.landingPageTitle)
      formData.append('landingPageDescription', data.landingPageDescription)

      // Append files if present
      if (data.logo instanceof File) {
        formData.append('logo', data.logo)
      }
      if (data.favicon instanceof File) {
        formData.append('favicon', data.favicon)
      }

      console.log('[UPDATE] Sending FormData to /tenant/setting')

      const response = await api<TenantSettingResponse>('/tenant/setting', {
        method: 'PUT',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('[UPDATE] Success:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('[UPDATE] Error:', error.response?.data || error.message)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update tenant settings'
      throw new Error(errorMessage)
    }
  })

// Get tenant settings
export const getTenantSetting = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api<TenantSettingResponse>('/tenant/setting', {
        method: 'GET',
      })
      console.log('[GET] Tenant settings:', response.data.data)
      return response.data.data
    } catch (error: any) {
      // ✅ Return null if settings don't exist (409 Conflict)
      if (error.response?.status === 409) {
        console.log('[GET] No settings found (expected for first time)')
        return null
      }
      console.error('[GET] Error:', error.response?.data || error.message)
      throw error
    }
  }
)

// Get tenant assets (logo/favicon)
export const getTenantSettingAssets = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const response = await api<TenantSettingAssetsResponse>(
        '/tenant/setting/asset',
        {
          method: 'GET',
        }
      )
      console.log('[GET ASSETS] Tenant assets:', response.data.data)
      return response.data.data
    } catch (error: any) {
      // ✅ Return null assets if they don't exist
      if (error.response?.status === 409) {
        console.log('[GET ASSETS] No assets found')
        return { logo: null, favicon: null }
      }
      console.error('[GET ASSETS] Error:', error.response?.data || error.message)
      return { logo: null, favicon: null }
    }
  }
)