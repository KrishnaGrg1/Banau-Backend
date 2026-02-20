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
  ImageIcon,
  Package,
  Tag,
  Boxes,
  ArrowLeft,
} from 'lucide-react'
import { useState } from 'react'
import { useCreateProduct } from '@/hooks/use-product'

export const Route = createFileRoute('/dashboard/products/new')({
  component: AddProductPage,
})

// ── Sub-components (identical pattern to branding.tsx) ───────────────────────

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
  previewSize: 'sm' | 'md' | 'lg'
  preview: string | null
  existingUrl?: string | null
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
  const src = preview ?? existingUrl ?? null
  const dim =
    previewSize === 'lg'
      ? 'h-20 w-20'
      : previewSize === 'md'
        ? 'h-16 w-16'
        : 'h-12 w-12'
  const iconDim =
    previewSize === 'lg'
      ? 'h-7 w-7'
      : previewSize === 'md'
        ? 'h-5 w-5'
        : 'h-4 w-4'

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

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors?.length) return null
  const msg =
    typeof errors[0] === 'string' ? errors[0] : (errors[0] as any)?.message
  if (!msg) return null
  return <p className="text-xs text-destructive">{msg}</p>
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AddProductPage() {
  const navigate = useNavigate()
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { mutateAsync, isPending, isSuccess, isError, error } =
    useCreateProduct()

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '' as unknown as number,
      quantity: 0,
      sku: '',
      categoryId: '',
      status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
      featured: false,
      trackInventory: true,
      image: null as string | null,
      imageName: '' as string,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({ data: value })
    },
  })

  // ── File handler — same factory pattern as branding.tsx ───────────────────

  function makeFileHandler(
    fieldChange: (v: string | null) => void,
    setPreview: (v: string | null) => void,
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      if (!file) {
        fieldChange(null)
        form.setFieldValue('imageName', '')
        setPreview(null)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const b64 = reader.result as string
        fieldChange(b64)
        form.setFieldValue('imageName', file.name)
        setPreview(b64)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-8 p-6 max-w-4xl">
      {/* ── Page header ── */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate({ to: '/dashboard/products' })}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Products
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Products
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Add Product
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to list a new product in your store.
        </p>
      </div>

      {/* ── Status banners ── */}
      {isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-foreground font-medium">
            Product created successfully.
          </span>
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <span className="text-destructive">
            {(error as any)?.message || 'Failed to create product.'}
          </span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-8"
      >
        {/* ── Section: Image ── */}
        <section className="space-y-5">
          <SectionHeader
            icon={<ImageIcon className="h-4 w-4" />}
            title="Product Image"
            desc="Upload a photo of your product"
          />

          <form.Field name="image">
            {(field) => (
              <AssetUpload
                id="product-image"
                label="Product Photo"
                hint="PNG, JPG, WebP · up to 10 MB · Recommended 800×800 px"
                previewSize="lg"
                preview={imagePreview}
                existingUrl={null}
                onClear={() => {
                  field.handleChange(null)
                  form.setFieldValue('imageName', '')
                  setImagePreview(null)
                }}
                onChange={makeFileHandler(field.handleChange, setImagePreview)}
              />
            )}
          </form.Field>
        </section>

        {/* ── Section: Basic Info ── */}
        <section className="space-y-5">
          <SectionHeader
            icon={<Package className="h-4 w-4" />}
            title="Basic Info"
            desc="Name, description, and visibility"
          />
          <div className="space-y-4">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? 'Product name is required'
                    : value.length < 2
                      ? 'Min 2 characters'
                      : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Wireless Earbuds Pro"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="rounded-xl"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product — features, materials, dimensions…"
                    rows={4}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-xl resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown on the product detail page in your storefront.
                  </p>
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="status">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex gap-2">
                      {(['DRAFT', 'ACTIVE', 'ARCHIVED'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => field.handleChange(s)}
                          className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                            field.state.value === s
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="featured">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Featured</Label>
                    <button
                      type="button"
                      onClick={() => field.handleChange(!field.state.value)}
                      className={`w-full rounded-xl border py-2 text-xs font-semibold transition-all ${
                        field.state.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {field.state.value ? '⭐ Featured' : 'Not Featured'}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Featured products appear on your storefront hero.
                    </p>
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        </section>

        {/* ── Section: Pricing & Inventory ── */}
        <section className="space-y-5">
          <SectionHeader
            icon={<Boxes className="h-4 w-4" />}
            title="Pricing & Inventory"
            desc="Price, stock quantity, and SKU"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field
              name="price"
              validators={{
                onChange: ({ value }) =>
                  value === undefined || value === null || (value as any) === ''
                    ? 'Price is required'
                    : Number(value) < 0
                      ? 'Price must be positive'
                      : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Price <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      onBlur={field.handleBlur}
                      className="rounded-xl pl-7"
                    />
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="quantity">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    Stock Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave 0 if inventory tracking is disabled.
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="sku">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="sku" className="text-sm font-medium">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    placeholder="e.g. WEP-BLK-001"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-xl font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Internal product code for inventory management.
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="trackInventory">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Track Inventory</Label>
                  <button
                    type="button"
                    onClick={() => field.handleChange(!field.state.value)}
                    className={`w-full rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                      field.state.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {field.state.value
                      ? '✓ Tracking Enabled'
                      : 'Tracking Disabled'}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Enables low-stock alerts in your dashboard.
                  </p>
                </div>
              )}
            </form.Field>
          </div>
        </section>

        {/* ── Section: Organisation ── */}
        <section className="space-y-5">
          <SectionHeader
            icon={<Tag className="h-4 w-4" />}
            title="Organisation"
            desc="Category assignment"
          />
          <form.Field name="categoryId">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="categoryId" className="text-sm font-medium">
                  Category
                </Label>
                <Input
                  id="categoryId"
                  placeholder="Select a category…"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Replace with a{' '}
                  <code className="font-mono text-[11px] bg-muted px-1 rounded">
                    {'<Select>'}
                  </code>{' '}
                  wired to your categories query.
                </p>
              </div>
            )}
          </form.Field>
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
                Creating…
              </>
            ) : (
              'Create Product'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate({ to: '/dashboard/products' })}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl ml-auto text-xs text-muted-foreground"
            disabled={isPending}
            onClick={() => {
              form.setFieldValue('status', 'DRAFT')
              form.handleSubmit()
            }}
          >
            Save as Draft
          </Button>
        </div>
      </form>
    </div>
  )
}
