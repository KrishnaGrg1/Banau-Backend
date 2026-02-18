// apps/web/app/routes/dashboard/settings/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Upload, X, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  useSaveTenantSetting, // ✅ Use smart hook
  usegetTenantSettingAsset,
  useTenantSetting,
} from '@/hooks/use-setting'

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsPage,
})

export default function SettingsPage() {
  const navigate = useNavigate()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

  // Fetch existing settings and assets
  const { data: settingsData, isLoading: isLoadingSettings } =
    useTenantSetting()
  const { data: assetsData } = usegetTenantSettingAsset()

  // ✅ Use smart save hook (auto-detects create vs update)
  const { mutateAsync, isSuccess, isError, error, isPending } =
    useSaveTenantSetting()

  const form = useForm({
    defaultValues: {
      primaryColorCode: '#4F46E5',
      secondaryColorCode: '#10B981',
      primaryTextColorCode: '#FFFFFF',
      secondaryTextColorCode: '#FFFFFF',
      backgroundColorCode: '#FFFFFF',
      backgroundTextColorCode: '#111827',
      landingPageTitle: '',
      landingPageDescription: '',
      logo: null as File | null,
      favicon: null as File | null,
    },
    onSubmit: async ({ value }) => {
      console.log('[FORM] Submitting:', value)
      await mutateAsync({ data: value })
    },
  })

  // ✅ Update form values when settings load
  useEffect(() => {
    if (settingsData) {
      console.log('[FORM] Pre-filling with existing data:', settingsData)
      form.setFieldValue('primaryColorCode', settingsData.primaryColorCode)
      form.setFieldValue('secondaryColorCode', settingsData.secondaryColorCode)
      form.setFieldValue(
        'primaryTextColorCode',
        settingsData.primaryTextColorCode,
      )
      form.setFieldValue(
        'secondaryTextColorCode',
        settingsData.secondaryTextColorCode,
      )
      form.setFieldValue(
        'backgroundColorCode',
        settingsData.backgroundColorCode,
      )
      form.setFieldValue(
        'backgroundTextColorCode',
        settingsData.backgroundTextColorCode,
      )
      form.setFieldValue('landingPageTitle', settingsData.landingPageTitle)
      form.setFieldValue(
        'landingPageDescription',
        settingsData.landingPageDescription,
      )
    }
  }, [settingsData])

  const handleLogoChange = (file: File | null) => {
    if (file) {
      console.log('[LOGO] Selected:', file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  const handleFaviconChange = (file: File | null) => {
    if (file) {
      console.log('[FAVICON] Selected:', file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFaviconPreview(null)
    }
  }

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-2">
          Customize your store's appearance and branding
        </p>
        {settingsData && (
          <p className="text-sm text-blue-600 mt-1">
            ✓ Settings exist - any changes will update existing configuration
          </p>
        )}
        {!settingsData && (
          <p className="text-sm text-yellow-600 mt-1">
            ⚠ No settings yet - this will create your initial configuration
          </p>
        )}
      </div>

      {isSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings {settingsData ? 'updated' : 'created'} successfully!
          </AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {(error as any)?.message || 'Failed to save settings'}
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* Branding Section */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Upload your logo and favicon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <form.Field name="logo">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    {logoPreview || assetsData?.logo?.url ? (
                      <div className="relative">
                        <img
                          src={logoPreview || assetsData?.logo?.url}
                          alt="Logo preview"
                          className="h-20 w-20 object-contain rounded border border-gray-200"
                        />
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              field.handleChange(null)
                              setLogoPreview(null)
                            }}
                            className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-20 w-20 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex-1">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          field.handleChange(file)
                          handleLogoChange(file)
                        }}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB
                        {assetsData?.logo && !logoPreview && ' (currently set)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Favicon Upload */}
            <form.Field name="favicon">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    {faviconPreview || assetsData?.favicon?.url ? (
                      <div className="relative">
                        <img
                          src={faviconPreview || assetsData?.favicon?.url}
                          alt="Favicon preview"
                          className="h-12 w-12 object-contain rounded border border-gray-200"
                        />
                        {faviconPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              field.handleChange(null)
                              setFaviconPreview(null)
                            }}
                            className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center">
                        <Upload className="h-4 w-4 text-gray-400" />
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex-1">
                      <Input
                        id="favicon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          field.handleChange(file)
                          handleFaviconChange(file)
                        }}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        32×32 or 16×16 pixels recommended
                        {assetsData?.favicon &&
                          !faviconPreview &&
                          ' (currently set)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card>
          <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
            <CardDescription>Customize your store's colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Color */}
              <form.Field name="primaryColorCode">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="primaryColorCode">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColorCode"
                        type="color"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-10 w-20 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Secondary Color */}
              <form.Field name="secondaryColorCode">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColorCode">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColorCode"
                        type="color"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-10 w-20 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Primary Text Color */}
              <form.Field name="primaryTextColorCode">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="primaryTextColorCode">
                      Primary Text Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryTextColorCode"
                        type="color"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-10 w-20 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Secondary Text Color */}
              <form.Field name="secondaryTextColorCode">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="secondaryTextColorCode">
                      Secondary Text Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryTextColorCode"
                        type="color"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-10 w-20 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Background Color */}
              <form.Field name="backgroundColorCode">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColorCode">
                      Background Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColorCode"
                        type="color"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-10 w-20 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Background Text Color */}
              <form.Field name="backgroundTextColorCode">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="backgroundTextColorCode">
                      Background Text Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundTextColorCode"
                        type="color"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-10 w-20 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              <div className="mt-8">
                <h3 className="text-base sm:text-lg md:text-xl font-medium mb-4">
                  Setting Preview
                </h3>

                <div
                  className="rounded-lg p-8 border shadow-sm"
                  style={{
                    backgroundColor: form.state.values.backgroundColorCode,
                  }}
                >
                  <div className="text-center my-6">
                    <p
                      className="text-sm sm:base"
                      style={{
                        color: form.state.values.backgroundTextColorCode,
                      }}
                    >
                      Setting Preview Descrption
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-4">
                    <button
                      type="button"
                      className="text-sm sm:text-base font-medium rounded-md px-6 py-3 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      style={{
                        backgroundColor: form.state.values.primaryColorCode,
                        color: form.state.values.primaryTextColorCode,
                      }}
                    >
                      Setting primary button
                    </button>

                    {/* <!-- Secondary Button --> */}
                    <button
                      type="button"
                      className="text-sm sm:text-base font-medium rounded-md px-6 py-3 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      style={{
                        backgroundColor: form.state.values.secondaryColorCode,
                        color: form.state.values.secondaryTextColorCode,
                      }}
                    >
                      Secondary Button Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landing Page Section */}
        <Card>
          <CardHeader>
            <CardTitle>Landing Page</CardTitle>
            <CardDescription>
              Configure your storefront landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Landing Page Title */}
            <form.Field name="landingPageTitle">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="landingPageTitle">Title</Label>
                  <Input
                    id="landingPageTitle"
                    placeholder="Welcome to Our Store"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            {/* Landing Page Description */}
            <form.Field name="landingPageDescription">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="landingPageDescription">Description</Label>
                  <Textarea
                    id="landingPageDescription"
                    placeholder="Discover our amazing products and services..."
                    rows={4}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {settingsData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{settingsData ? 'Update Settings' : 'Create Settings'}</>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
