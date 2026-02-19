import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Palette,
  ImageIcon,
  FileText,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  useSaveTenantSetting,
  usegetTenantSettingAsset,
  useTenantSetting,
} from '@/hooks/use-setting'

export const Route = createFileRoute('/dashboard/settings/branding')({
  component: BrandingPage,
})

// ── Color field pairs config ──────────────────────────────────────────────────

const COLOR_FIELDS = [
  {
    name: 'primaryColorCode',
    label: 'Primary',
    desc: 'Buttons, links, accents',
  },
  {
    name: 'primaryTextColorCode',
    label: 'Primary Text',
    desc: 'Text on primary elements',
  },
  {
    name: 'secondaryColorCode',
    label: 'Secondary',
    desc: 'Secondary actions & highlights',
  },
  {
    name: 'secondaryTextColorCode',
    label: 'Secondary Text',
    desc: 'Text on secondary elements',
  },
  { name: 'backgroundColorCode', label: 'Background', desc: 'Page background' },
  {
    name: 'backgroundTextColorCode',
    label: 'Background Text',
    desc: 'Body text color',
  },
] as const

type ColorFieldName = (typeof COLOR_FIELDS)[number]['name']

// ── Component ─────────────────────────────────────────────────────────────────

export default function BrandingPage() {
  const navigate = useNavigate()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

  const { data: settingsData, isLoading } = useTenantSetting()
  const { data: assetsData } = usegetTenantSettingAsset()
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
      logo: null as string | null,
      logoName: '' as string,
      favicon: null as string | null,
      faviconName: '' as string,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({ data: value })
    },
  })

  useEffect(() => {
    if (!settingsData) return
    const fields: (keyof typeof settingsData)[] = [
      'primaryColorCode',
      'secondaryColorCode',
      'primaryTextColorCode',
      'secondaryTextColorCode',
      'backgroundColorCode',
      'backgroundTextColorCode',
      'landingPageTitle',
      'landingPageDescription',
    ]
    fields.forEach((f) => form.setFieldValue(f as any, settingsData[f] as any))
  }, [settingsData])

  // ── File handler factory ──────────────────────────────────────────────────

  function makeFileHandler(
    fieldChange: (v: string | null) => void,
    nameField: 'logoName' | 'faviconName',
    setPreview: (v: string | null) => void,
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      if (!file) {
        fieldChange(null)
        form.setFieldValue(nameField, '')
        setPreview(null)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const b64 = reader.result as string
        fieldChange(b64)
        form.setFieldValue(nameField, file.name)
        setPreview(b64)
      }
      reader.readAsDataURL(file)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const vals = form.state.values

  return (
    <div className="flex flex-col flex-1 gap-8 p-6 max-w-4xl">
      {/* ── Page header ── */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Settings
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Branding
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize your store's visual identity — logo, favicon, colors, and
          landing page copy.
        </p>
      </div>

      {/* ── Status banners ── */}
      {isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-foreground font-medium">
            Settings {settingsData ? 'updated' : 'created'} successfully.
          </span>
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <span className="text-destructive">
            {(error as any)?.message || 'Failed to save settings.'}
          </span>
        </div>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await mutateAsync({ data: vals })
        }}
        className="space-y-8"
      >
        {/* ── Section: Assets ── */}
        <section className="space-y-5">
          <SectionHeader
            icon={<ImageIcon className="h-4 w-4" />}
            title="Assets"
            desc="Your logo and favicon"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Logo */}
            <form.Field name="logo">
              {(field) => (
                <AssetUpload
                  id="logo"
                  label="Logo"
                  hint="PNG, JPG, SVG · up to 10 MB"
                  previewSize="lg"
                  preview={logoPreview}
                  existingUrl={assetsData?.logo?.url}
                  existingLabel={
                    assetsData?.logo && !logoPreview
                      ? 'Current logo set'
                      : undefined
                  }
                  onClear={() => {
                    field.handleChange(null)
                    form.setFieldValue('logoName', '')
                    setLogoPreview(null)
                  }}
                  onChange={makeFileHandler(
                    field.handleChange,
                    'logoName',
                    setLogoPreview,
                  )}
                />
              )}
            </form.Field>

            {/* Favicon */}
            <form.Field name="favicon">
              {(field) => (
                <AssetUpload
                  id="favicon"
                  label="Favicon"
                  hint="32×32 or 16×16 px · ICO, PNG"
                  previewSize="sm"
                  preview={faviconPreview}
                  existingUrl={assetsData?.favicon?.url}
                  existingLabel={
                    assetsData?.favicon && !faviconPreview
                      ? 'Current favicon set'
                      : undefined
                  }
                  onClear={() => {
                    field.handleChange(null)
                    form.setFieldValue('faviconName', '')
                    setFaviconPreview(null)
                  }}
                  onChange={makeFileHandler(
                    field.handleChange,
                    'faviconName',
                    setFaviconPreview,
                  )}
                />
              )}
            </form.Field>
          </div>
        </section>

        {/* ── Section: Colors ── */}
        <section className="space-y-5">
          <SectionHeader
            icon={<Palette className="h-4 w-4" />}
            title="Color Scheme"
            desc="Used across your storefront"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_FIELDS.map((cf) => (
              <form.Field key={cf.name} name={cf.name}>
                {(field) => (
                  <ColorField
                    id={cf.name}
                    label={cf.label}
                    desc={cf.desc}
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
            ))}
          </div>

          {/* Live preview */}
          <div className="mt-2 rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Live Preview
              </p>
            </div>
            <div
              className="p-10 flex flex-col items-center gap-6"
              style={{ backgroundColor: vals.backgroundColorCode }}
            >
              <p
                className="text-sm font-medium text-center"
                style={{ color: vals.backgroundTextColorCode }}
              >
                How your storefront background and text look together
              </p>
              <div className="flex flex-wrap items-center gap-4 justify-center">
                <button
                  type="button"
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: vals.primaryColorCode,
                    color: vals.primaryTextColorCode,
                  }}
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: vals.secondaryColorCode,
                    color: vals.secondaryTextColorCode,
                  }}
                >
                  Secondary Button
                </button>
              </div>
              {/* Mini nav bar preview */}
              <div
                className="w-full max-w-sm rounded-xl px-4 py-2.5 flex items-center justify-between"
                style={{ backgroundColor: vals.primaryColorCode }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: vals.primaryTextColorCode }}
                >
                  Store Name
                </span>
                <div className="flex items-center gap-3">
                  {['Home', 'Products'].map((l) => (
                    <span
                      key={l}
                      className="text-[11px]"
                      style={{
                        color: vals.primaryTextColorCode,
                        opacity: 0.75,
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: Landing Page ── */}
        <section className="space-y-5">
          <SectionHeader
            icon={<FileText className="h-4 w-4" />}
            title="Landing Page"
            desc="Hero section copy on your storefront"
          />

          <div className="space-y-4">
            <form.Field name="landingPageTitle">
              {(field) => (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="landingPageTitle"
                    className="text-sm font-medium"
                  >
                    Headline
                  </Label>
                  <Input
                    id="landingPageTitle"
                    placeholder="Welcome to Our Store"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown as the large heading on your store's hero section.
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="landingPageDescription">
              {(field) => (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="landingPageDescription"
                    className="text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="landingPageDescription"
                    placeholder="Discover our amazing products and services..."
                    rows={4}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-xl resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    A short tagline below the headline.
                  </p>
                </div>
              )}
            </form.Field>

            {/* Copy preview */}
            {(vals.landingPageTitle || vals.landingPageDescription) && (
              <div
                className="rounded-2xl border border-border p-8 space-y-3"
                style={{ backgroundColor: vals.backgroundColorCode }}
              >
                {vals.landingPageTitle && (
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: vals.backgroundTextColorCode }}
                  >
                    {vals.landingPageTitle}
                  </h2>
                )}
                {vals.landingPageDescription && (
                  <p
                    className="text-sm leading-relaxed max-w-lg"
                    style={{
                      color: vals.backgroundTextColorCode,
                      opacity: 0.75,
                    }}
                  >
                    {vals.landingPageDescription}
                  </p>
                )}
                <button
                  type="button"
                  className="mt-2 rounded-xl px-5 py-2 text-xs font-semibold"
                  style={{
                    backgroundColor: vals.primaryColorCode,
                    color: vals.primaryTextColorCode,
                  }}
                >
                  Shop Now →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl px-8"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {settingsData ? 'Updating…' : 'Saving…'}
              </>
            ) : settingsData ? (
              'Update Settings'
            ) : (
              'Save Settings'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Cancel
          </Button>
          {settingsData && (
            <p className="ml-auto text-xs text-muted-foreground">
              Last saved · settings exist
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-center gap-3 pb-1 border-b border-border">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

interface AssetUploadProps {
  id: string
  label: string
  hint: string
  previewSize: 'sm' | 'lg'
  preview: string | null
  existingUrl?: string
  existingLabel?: string
  onClear: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function AssetUpload({
  id,
  label,
  hint,
  previewSize,
  preview,
  existingUrl,
  existingLabel,
  onClear,
  onChange,
}: AssetUploadProps) {
  const src = preview ?? existingUrl
  const dim = previewSize === 'lg' ? 'h-20 w-20' : 'h-12 w-12'
  const iconDim = previewSize === 'lg' ? 'h-7 w-7' : 'h-4 w-4'

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>

      <div className="flex items-start gap-4">
        {/* Preview / placeholder */}
        <div className="relative shrink-0">
          {src ? (
            <>
              <img
                src={src}
                alt={`${label} preview`}
                className={`${dim} object-contain rounded-xl border border-border bg-muted`}
              />
              {preview && (
                <button
                  type="button"
                  onClick={onClear}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </>
          ) : (
            <div
              className={`${dim} rounded-xl border border-dashed border-border bg-muted/50 flex items-center justify-center`}
            >
              <Upload className={`${iconDim} text-muted-foreground`} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-1 space-y-1.5">
          <Input
            id={id}
            type="file"
            accept="image/*"
            onChange={onChange}
            className="cursor-pointer rounded-xl text-xs"
          />
          <p className="text-[11px] text-muted-foreground">{hint}</p>
          {existingLabel && (
            <p className="text-[11px] text-primary font-medium">
              ✓ {existingLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface ColorFieldProps {
  id: string
  label: string
  desc: string
  value: string
  onChange: (v: string) => void
}

function ColorField({ id, label, desc, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Swatch */}
        <div className="relative">
          <Input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border-border p-0.5"
          />
        </div>
        {/* Hex text */}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="flex-1 font-mono text-xs rounded-lg h-9"
          placeholder="#000000"
        />
        {/* Color dot preview */}
        <div
          className="h-9 w-9 rounded-lg border border-border shrink-0"
          style={{ backgroundColor: value }}
          title={value}
        />
      </div>
    </div>
  )
}
