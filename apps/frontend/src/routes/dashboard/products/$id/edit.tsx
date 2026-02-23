import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  Package,
  DollarSign,
  BarChart3,
  Truck,
  Search,
  Eye,
  Tag,
  ImageIcon,
  ChevronLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useUpdateProduct, useGetProductById } from '@/hooks/use-product'
import { AssetUpload } from '../new'

export const Route = createFileRoute('/dashboard/products/$id/edit')({
  component: EditProductPage,
})

// ─── helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors?.length) return null
  const msg =
    typeof errors[0] === 'string' ? errors[0] : (errors[0] as any)?.message
  if (!msg) return null
  return (
    <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  )
}

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
    <div className="flex items-start gap-3 pb-1">
      <div className="rounded-lg bg-muted p-2 text-muted-foreground shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

// ─── route component (loads data, guards) ─────────────────────────────────────

export default function EditProductPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: product, isLoading, error: fetchError } = useGetProductById(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground font-medium">
          Failed to load product
        </p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/dashboard/products' })}
        >
          Back to Products
        </Button>
      </div>
    )
  }

  if (!product) return null

  // Only render the form once we have stable product data
  return <EditProductForm product={product} id={id} />
}

// ─── form component ───────────────────────────────────────────────────────────

type Product = NonNullable<ReturnType<typeof useGetProductById>['data']>

function EditProductForm({ product, id }: { product: Product; id: string }) {
  const navigate = useNavigate()
  const { mutateAsync, isPending, error: updateError } = useUpdateProduct()

  const [productImagePreview, setProductImagePreview] = useState<string | null>(
    product.featuredImage?.url ?? null,
  )

  const form = useForm({
    defaultValues: {
      name: product.name ?? '',
      description: product.description ?? '',
      slug: product.slug ?? '',
      price: (product.price ?? '') as string | number,
      compareAtPrice: (product.compareAtPrice ?? '') as string | number,
      quantity: String(product.quantity ?? ''),
      trackInventory: product.trackInventory ?? true,
      status: (product.status ?? 'DRAFT') as 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
      featured: product.featured ?? false,
      sku: product.sku ?? '',
      barcode: product.barcode ?? '',
      metaTitle: product.metaTitle ?? '',
      metaDescription: product.metaDescription ?? '',
      weight: (product.weight ?? '') as string | number,
      weightUnit: product.weightUnit ?? 'kg',
      taxable: product.taxable ?? true,
      product_image: product.featuredImage?.url as string | undefined,
      productImageName: product.featuredImage?.fileName ?? '',
    },
    onSubmit: async ({ value }) => {
      const validStatus = ['DRAFT', 'ACTIVE', 'ARCHIVED']
      const status = validStatus.includes(value.status) ? value.status : 'DRAFT'
      await mutateAsync({
        data: {
          id,
          product: {
            ...value,
            status,
            quantity: value.quantity === '' ? 0 : Number(value.quantity),
            price: value.price !== '' ? Number(value.price) : undefined,
            compareAtPrice:
              value.compareAtPrice !== ''
                ? Number(value.compareAtPrice)
                : undefined,
            weight: value.weight !== '' ? Number(value.weight) : undefined,
          },
        },
      })
      navigate({ to: '/dashboard/products' })
    },
  })

  function makeFileHandler(
    fieldChange: (v: string | undefined) => void,
    setPreview: (v: string | null) => void,
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      if (!file) {
        fieldChange(undefined)
        setPreview(null)
        form.setFieldValue('productImageName', '')
        return
      }
      form.setFieldValue('productImageName', file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        const b64 = reader.result as string
        fieldChange(b64)
        setPreview(b64)
      }
      reader.readAsDataURL(file)
    }
  }

  const vals = form.state.values

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page header ── */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => navigate({ to: '/dashboard/products' })}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
              Products
            </button>
            <span className="text-muted-foreground/40">/</span>
            <span className="flex items-center gap-1.5 text-sm font-medium truncate">
              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
              {vals.name || 'Edit Product'}
            </span>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Inline status picker */}
            <form.Field name="status">
              {(field) => (
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as any)}
                >
                  <SelectTrigger className="h-8 rounded-lg text-xs w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </form.Field>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => navigate({ to: '/dashboard/products' })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-lg gap-1.5"
              disabled={isPending}
              onClick={() => form.handleSubmit()}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Update product
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* ════ LEFT COLUMN ════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <SectionHeader
                icon={<Package className="h-4 w-4" />}
                title="Basic Information"
                desc="Name, description, and URL slug"
              />

              {/* Name */}
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'Name is required'
                      : value.length < 2
                        ? 'Name must be at least 2 characters'
                        : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      Product Name
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. Wireless Headphones Pro"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value)
                        if (
                          !vals.slug ||
                          vals.slug === generateSlug(vals.name ?? '')
                        ) {
                          form.setFieldValue(
                            'slug',
                            generateSlug(e.target.value),
                          )
                        }
                      }}
                      onBlur={field.handleBlur}
                      className="rounded-xl"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              {/* Description */}
              <form.Field name="description">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      Description
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder="Describe your product…"
                      rows={4}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="rounded-xl resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports markdown formatting
                    </p>
                  </div>
                )}
              </form.Field>

              {/* Slug */}
              <form.Field
                name="slug"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'Slug is required'
                      : value.length < 2
                        ? 'Slug must be at least 2 characters'
                        : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
                          ? 'Only lowercase letters, numbers, and hyphens allowed'
                          : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      URL Slug
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none pointer-events-none">
                        /products/
                      </span>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="rounded-xl pl-[88px] font-mono text-sm"
                        placeholder="wireless-headphones-pro"
                      />
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                    {!field.state.meta.errors?.length && (
                      <p className="text-xs text-muted-foreground">
                        Used in your product URL: /products/your-slug
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <SectionHeader
                icon={<DollarSign className="h-4 w-4" />}
                title="Pricing"
                desc="Set your price and optional compare price"
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <form.Field
                  name="price"
                  validators={{
                    onChange: ({ value }) =>
                      value === '' || value === undefined
                        ? 'Price is required'
                        : isNaN(Number(value))
                          ? 'Price must be a valid number'
                          : Number(value) < 0
                            ? 'Price cannot be negative'
                            : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Price
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                          $
                        </span>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="rounded-xl pl-7"
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                {/* Compare-at Price */}
                <form.Field
                  name="compareAtPrice"
                  validators={{
                    onChange: ({ value }) =>
                      value !== '' &&
                      value !== undefined &&
                      isNaN(Number(value))
                        ? 'Must be a valid number'
                        : value !== '' &&
                            value !== undefined &&
                            Number(value) < 0
                          ? 'Cannot be negative'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Compare-at Price
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                          $
                        </span>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="rounded-xl pl-7"
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                      {!field.state.meta.errors?.length && (
                        <p className="text-xs text-muted-foreground">
                          Shown as strikethrough
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Taxable */}
              <form.Field name="taxable">
                {(field) => (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                    <div>
                      <p className="text-sm font-medium">Charge tax</p>
                      <p className="text-xs text-muted-foreground">
                        Apply tax rate to this product
                      </p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Inventory */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <SectionHeader
                icon={<BarChart3 className="h-4 w-4" />}
                title="Inventory"
                desc="Track stock levels and product identifiers"
              />

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="sku">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        SKU
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="SKU-001"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="rounded-xl font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Stock Keeping Unit
                      </p>
                    </div>
                  )}
                </form.Field>

                <form.Field name="barcode">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Barcode
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="0000000000000"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="rounded-xl font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        ISBN, UPC, EAN, etc.
                      </p>
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field
                name="quantity"
                validators={{
                  onChange: ({ value }) =>
                    value !== '' && Number(value) < 0
                      ? 'Quantity cannot be negative'
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      Quantity
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)} // ← string, not Number()
                      onBlur={field.handleBlur}
                      className="rounded-xl max-w-[180px]"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>
              <form.Field name="trackInventory">
                {(field) => (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                    <div>
                      <p className="text-sm font-medium">Track inventory</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically update stock on orders
                      </p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Shipping */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <SectionHeader
                icon={<Truck className="h-4 w-4" />}
                title="Shipping"
                desc="Weight used to calculate shipping rates"
              />

              <div className="grid grid-cols-[1fr_140px] gap-4">
                <form.Field
                  name="weight"
                  validators={{
                    onChange: ({ value }) =>
                      value !== '' && isNaN(Number(value))
                        ? 'Weight must be a valid number'
                        : value !== '' && Number(value) < 0
                          ? 'Weight cannot be negative'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-foreground"
                      >
                        Weight
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="rounded-xl"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="weightUnit">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">
                        Unit
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <SectionHeader
                icon={<Search className="h-4 w-4" />}
                title="Search Engine Optimization"
                desc="How your product appears in search results"
              />

              <form.Field
                name="metaTitle"
                validators={{
                  onChange: ({ value }) =>
                    value && value.length > 60
                      ? `${value.length - 60} characters over the recommended limit`
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      Meta Title
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Product title for search engines"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="rounded-xl"
                      maxLength={80}
                    />
                    <FieldError errors={field.state.meta.errors} />
                    {!field.state.meta.errors?.length && (
                      <p className="text-xs text-muted-foreground">
                        {(field.state.value ?? '').length}/60 characters
                        recommended
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="metaDescription"
                validators={{
                  onChange: ({ value }) =>
                    value && value.length > 160
                      ? `${value.length - 160} characters over the recommended limit`
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-foreground"
                    >
                      Meta Description
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder="Brief description shown in search results…"
                      rows={3}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="rounded-xl resize-none"
                      maxLength={200}
                    />
                    <FieldError errors={field.state.meta.errors} />
                    {!field.state.meta.errors?.length && (
                      <p className="text-xs text-muted-foreground">
                        {(field.state.value ?? '').length}/160 characters
                        recommended
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Google preview */}
              {(vals.metaTitle || vals.metaDescription || vals.name) && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                    Google Preview
                  </p>
                  <p className="text-sm text-blue-600 font-medium truncate">
                    {vals.metaTitle || vals.name || 'Product Name'}
                  </p>
                  <p className="text-xs text-green-700">
                    yourstore.com/products/{vals.slug || 'product-slug'}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {vals.metaDescription ||
                      vals.description ||
                      'No description set.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
              <SectionHeader
                icon={<ImageIcon className="h-4 w-4" />}
                title="Product Image"
                desc="Main image shown in listings"
              />

              <form.Field name="product_image">
                {(field) => (
                  <AssetUpload
                    id="product_image"
                    label="Product Image"
                    hint="PNG, JPG, WEBP · up to 10 MB"
                    previewSize="lg"
                    preview={productImagePreview}
                    existingUrl={product.featuredImage?.url}
                    existingLabel={
                      product.featuredImage?.url ? 'Current image' : undefined
                    }
                    onClear={() => {
                      field.handleChange(undefined)
                      setProductImagePreview(null)
                    }}
                    onChange={makeFileHandler(
                      field.handleChange,
                      setProductImagePreview,
                    )}
                  />
                )}
              </form.Field>
            </div>

            {/* Visibility */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
              <SectionHeader
                icon={<Eye className="h-4 w-4" />}
                title="Visibility"
                desc="Control how this product appears"
              />

              <form.Field
                name="status"
                validators={{
                  onChange: ({ value }) =>
                    !['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(value)
                      ? "Status must be 'DRAFT', 'ACTIVE', or 'ARCHIVED'"
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">
                      Status
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as any)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-400" />
                            Draft
                          </div>
                        </SelectItem>
                        <SelectItem value="ACTIVE">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="ARCHIVED">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                            Archived
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="featured">
                {(field) => (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3.5">
                    <div>
                      <p className="text-sm font-medium">Featured</p>
                      <p className="text-xs text-muted-foreground">
                        Show in featured sections
                      </p>
                    </div>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Server error */}
            {updateError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  {(updateError as Error).message}
                </p>
              </div>
            )}

            {/* Summary card */}
            <div className="rounded-2xl border border-border bg-foreground text-background p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 opacity-60" />
                <p className="text-sm font-semibold">Summary</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Name', value: vals.name || '—' },
                  {
                    label: 'Price',
                    value:
                      vals.price !== ''
                        ? `$${Number(vals.price).toFixed(2)}`
                        : '—',
                  },
                  { label: 'Status', value: vals.status },
                  { label: 'Stock', value: String(vals.quantity ?? 0) },
                  {
                    label: 'Image',
                    value: vals.product_image
                      ? '✓ New image'
                      : product.featuredImage?.url
                        ? '✓ Existing'
                        : '—',
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-xs opacity-50">{label}</span>
                    <span
                      className="text-xs font-medium opacity-90 truncate max-w-[150px]"
                      title={value}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="bg-white/10" />

              <Button
                type="button"
                variant="secondary"
                className="w-full rounded-xl font-semibold gap-2"
                disabled={isPending}
                onClick={() => form.handleSubmit()}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Update product
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
