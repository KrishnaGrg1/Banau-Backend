import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'
import { usePublicProductBySlug } from '@/hooks/use-public-product'
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Star,
  ArrowLeft,
  Shield,
  Truck,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/s/$subdomain/products/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  const { subdomain, slug } = Route.useParams()

  const { data: product, isLoading } = usePublicProductBySlug({
    subdomain,
    slug,
  })
  console.log('data', product)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const activeVariant = product?.variants?.find((v) => v.id === selectedVariant)
  const price = activeVariant
    ? Number(activeVariant.price)
    : Number(product?.price ?? 0)
  const compareAt = activeVariant
    ? activeVariant.compareAtPrice
      ? Number(activeVariant.compareAtPrice)
      : null
    : product?.compareAtPrice
      ? Number(product.compareAtPrice)
      : null
  const discount = compareAt
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null
  const inStock = product?.trackInventory
    ? (activeVariant ? activeVariant.quantity : product.quantity) > 0
    : true

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square rounded-2xl bg-muted" />
          <div className="space-y-4 pt-4">
            <div className="h-4 rounded-full bg-muted w-1/4" />
            <div className="h-8 rounded-full bg-muted w-3/4" />
            <div className="h-4 rounded-full bg-muted w-1/2" />
            <div className="h-24 rounded-xl bg-muted w-full mt-4" />
            <div className="h-12 rounded-xl bg-muted w-full mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">Product not found</p>
        <p className="text-sm text-muted-foreground">
          This product may have been removed or doesn't exist.
        </p>
        <Link
          to="/s/$subdomain/shop"
          params={{ subdomain }}
          className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          to="/s/$subdomain/"
          params={{ subdomain }}
          className="hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to="/s/$subdomain/products"
          params={{ subdomain }}
          className="hover:text-foreground transition-colors"
        >
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium line-clamp-1">
          {product.name}
        </span>
      </nav>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl border border-border bg-muted overflow-hidden relative">
            {product.featuredImage ? (
              <img
                src={product.featuredImage.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted via-muted/60 to-muted/30">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="h-20 w-20 rounded-2xl bg-background/60 backdrop-blur-sm border border-border flex items-center justify-center">
                  <ShoppingBag className="h-9 w-9 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">
                  No image available
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount && (
                <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">
                  -{discount}% OFF
                </span>
              )}
              {product.featured && (
                <span className="text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> Featured
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Info */}
        <div className="space-y-6">
          {/* Name + wishlist */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {product.sku && (
                <p className="text-xs font-mono text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {product.name}
              </h1>
            </div>
            <Button className="shrink-0 h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
              <Heart className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              ${price.toFixed(2)}
            </span>
            {compareAt && (
              <span className="text-lg text-muted-foreground line-through">
                ${compareAt.toFixed(2)}
              </span>
            )}
            {discount && (
              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-400'}`}
            />
            <span
              className={`text-sm font-medium ${inStock ? 'text-emerald-600' : 'text-destructive'}`}
            >
              {inStock
                ? product.trackInventory
                  ? `${activeVariant ? activeVariant.quantity : product.quantity} in stock`
                  : 'In Stock'
                : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-6">
              {product.description}
            </p>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 border-t border-border pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Variants
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    onClick={() =>
                      setSelectedVariant(
                        selectedVariant === variant.id ? null : variant.id,
                      )
                    }
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                      selectedVariant === variant.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    <span>{variant.name}</span>
                    {variant.option1Value && (
                      <span className="ml-1 text-muted-foreground">
                        · {variant.option1Value}
                      </span>
                    )}
                    {variant.price !== product.price && (
                      <span className="ml-1 font-semibold">
                        ${Number(variant.price).toFixed(2)}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="space-y-3 border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Quantity
            </p>
            <div className="flex items-center gap-3">
              {/* Qty selector */}
              <div className="flex items-center rounded-xl border border-border bg-card">
                <Button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <Button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Add to cart */}
              <Button
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 border-t border-border pt-6">
            {[
              {
                icon: Truck,
                label: 'Free Shipping',
                sub: 'On orders over $50',
              },
              { icon: Shield, label: 'Secure Payment', sub: '100% protected' },
              { icon: RotateCcw, label: 'Easy Returns', sub: '30 day policy' },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-border bg-card p-3"
              >
                <Icon className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-semibold text-foreground">
                  {label}
                </p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          {/* Meta */}
          {(product.weight || product.barcode) && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">
                    {product.weight} {product.weightUnit}
                  </span>
                </div>
              )}
              {product.barcode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode</span>
                  <span className="font-mono font-medium">
                    {product.barcode}
                  </span>
                </div>
              )}
              {product.taxable && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">Included</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related — placeholder for future */}
      <section className="border-t border-border pt-16 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            More Products
          </h2>
          <Link
            to="/s/$subdomain/shop"
            params={{ subdomain }}
            className="text-xs text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            View all
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Browse the full catalogue to find more items you'll love.
        </p>
      </section>
    </div>
  )
}
