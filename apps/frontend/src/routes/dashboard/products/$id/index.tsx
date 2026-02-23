import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  useGetProductById,
  useUpdateStock,
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '@/hooks/use-product'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogContent,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Loader2,
  Package,
  ChevronLeft,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
  AlertTriangle,
  BarChart3,
  DollarSign,
} from 'lucide-react'
import { useState } from 'react'
import { ProductDto, ProductVariantDto } from '@repo/shared'
import { useForm } from '@tanstack/react-form'

export const Route = createFileRoute('/dashboard/products/$id/')({
  component: ProductDetailPage,
})

function formatPrice(price: string | null) {
  if (!price) return '—'
  return `Rs.${parseFloat(price).toFixed(2)}`
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'DRAFT':
      return 'secondary'
    case 'ARCHIVED':
      return 'outline'
    default:
      return 'secondary'
  }
}

// Stock Update Dialog
function StockUpdateDialog({ product }: { product: ProductDto }) {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useUpdateStock()

  const form = useForm({
    defaultValues: {
      quantity: String(product.quantity),
      action: 'set' as 'set' | 'add' | 'subtract',
      reason: '',
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({
        productId: product.id,
        stock: {
          ...value,
          quantity: value.quantity === '' ? 0 : Number(value.quantity),
        },
      })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Update Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <DialogDescription>
            Current stock: {product.quantity} units
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="action">
            {(field) => (
              <div className="space-y-1.5">
                <Label>Action</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => {
                    field.handleChange(v as any)
                    if (v === 'set') {
                      form.setFieldValue('quantity', String(product.quantity))
                    } else {
                      form.setFieldValue('quantity', '')
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set to</SelectItem>
                    <SelectItem value="add">Add</SelectItem>
                    <SelectItem value="subtract">Subtract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <form.Field name="quantity">
            {(field) => (
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="reason">
            {(field) => (
              <div className="space-y-1.5">
                <Label>Reason (optional)</Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Inventory count"
                />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Add Variant Dialog
function AddVariantDialog({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useAddVariant()

  const form = useForm({
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      price: '',
      quantity: '',
      option1Name: '',
      option1Value: '',
      option2Name: '',
      option2Value: '',
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({
        productId,
        variant: {
          name: value.name,
          sku: value.sku || undefined,
          barcode: value.barcode || undefined,
          price: value.price ? Number(value.price) : undefined,
          quantity: value.quantity === '' ? 0 : Number(value.quantity),
          option1Name: value.option1Name || undefined,
          option1Value: value.option1Value || undefined,
          option2Name: value.option2Name || undefined,
          option2Value: value.option2Value || undefined,
        },
      })
      setOpen(false)
      form.reset()
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Product Variant</DialogTitle>
          <DialogDescription>
            Create a new variant for this product
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="name">
              {(field) => (
                <div className="space-y-1.5">
                  <Label>Variant Name *</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Small / Red"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="quantity">
              {(field) => (
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="sku">
              {(field) => (
                <div className="space-y-1.5">
                  <Label>SKU</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="SKU-001"
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="price">
              {(field) => (
                <div className="space-y-1.5">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
            </form.Field>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium">Variant Options</Label>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="option1Name">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Option 1 Name (e.g., Size)"
                  />
                )}
              </form.Field>
              <form.Field name="option1Value">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Option 1 Value (e.g., Small)"
                  />
                )}
              </form.Field>
              <form.Field name="option2Name">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Option 2 Name (e.g., Color)"
                  />
                )}
              </form.Field>
              <form.Field name="option2Value">
                {(field) => (
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Option 2 Value (e.g., Red)"
                  />
                )}
              </form.Field>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Variant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Variant Actions Menu
function VariantActionsMenu({
  productId,
  variant,
}: {
  productId: string
  variant: ProductVariantDto
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { mutateAsync: updateVariant, isPending: isUpdating } =
    useUpdateVariant()
  const { mutateAsync: deleteVariant, isPending: isDeleting } =
    useDeleteVariant()

  const form = useForm({
    defaultValues: {
      name: variant.name,
      sku: variant.sku || '',
      price: variant.price || '',
      quantity: variant.quantity,
    },
    onSubmit: async ({ value }) => {
      await updateVariant({
        productId,
        variantId: variant.id,
        variant: {
          name: value.name,
          sku: value.sku || undefined,
          price: value.price ? Number(value.price) : undefined,
          quantity: value.quantity,
        },
      })
      setEditOpen(false)
    },
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="quantity">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="sku">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>SKU</Label>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="price">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Variant</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete "{variant.name}"? This cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={async () => {
                await deleteVariant({ productId, variantId: variant.id })
                setDeleteOpen(false)
              }}
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function ProductDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useGetProductById(id)

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  if (error || !product)
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-medium">Failed to load product</p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/dashboard/products' })}
        >
          Back to Products
        </Button>
      </div>
    )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate({ to: '/dashboard/products' })}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Products
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Product Details
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              {product.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StockUpdateDialog product={product} />
          <Button
            onClick={() =>
              navigate({ to: '/dashboard/products/$id/edit', params: { id } })
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(product.price)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${product.quantity === 0 ? 'text-red-600' : product.quantity < 10 ? 'text-orange-600' : ''}`}
            >
              {product.quantity}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusColor(product.status)}>
              {product.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SKU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono">{product.sku || '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Product Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {product.featuredImage.url ? (
            <img
              src={product.featuredImage.url}
              alt={product.name}
              className="max-h-64 object-contain rounded border mx-auto"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Package className="h-16 w-16 mb-3 opacity-30" />
              <p className="text-sm">No product image</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  navigate({
                    to: '/dashboard/products/$id/edit',
                    params: { id },
                  })
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Info & Variants */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Slug</p>
                <p className="font-medium font-mono text-sm">{product.slug}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium whitespace-pre-wrap">
                {product.description || '—'}
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Compare-at Price
                </p>
                <p className="font-medium">
                  {formatPrice(product.compareAtPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <Badge variant={product.featured ? 'default' : 'outline'}>
                  {product.featured ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Barcode</p>
                <p className="font-mono text-sm">{product.barcode || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Track Inventory</p>
                <Badge variant={product.trackInventory ? 'default' : 'outline'}>
                  {product.trackInventory ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxable</p>
                <Badge variant={product.taxable ? 'default' : 'outline'}>
                  {product.taxable ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-medium">
                  {product.weight
                    ? `${product.weight} ${product.weightUnit || 'kg'}`
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              SEO & Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Meta Title</p>
              <p className="font-medium">{product.metaTitle || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meta Description</p>
              <p className="font-medium">{product.metaDescription || '—'}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Google Preview
              </p>
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <p className="text-sm text-blue-600 font-medium truncate">
                  {product.metaTitle || product.name || 'Product Name'}
                </p>
                <p className="text-xs text-green-700">
                  yourstore.com/products/{product.slug || 'product-slug'}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {product.metaDescription ||
                    product.description ||
                    'No description set.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variants Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Variants</CardTitle>
            <CardDescription>
              Product variations with different options
            </CardDescription>
          </div>
          <AddVariantDialog productId={product.id} />
        </CardHeader>
        <CardContent>
          {product.variants && product.variants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">
                      {variant.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {variant.sku || '—'}
                    </TableCell>
                    <TableCell>{formatPrice(variant.price)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          variant.quantity === 0
                            ? 'text-red-600'
                            : variant.quantity < 10
                              ? 'text-orange-600'
                              : ''
                        }
                      >
                        {variant.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <VariantActionsMenu
                        productId={product.id}
                        variant={variant}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No variants yet</p>
              <p className="text-sm">
                Add variants for different sizes, colors, etc.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
