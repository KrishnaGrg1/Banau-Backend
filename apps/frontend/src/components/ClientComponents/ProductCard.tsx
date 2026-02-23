import { ShoppingBag, ShoppingCart, Heart, Star } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export interface Product {
  id: string
  name: string
  description?: string | null
  slug: string
  price: string
  compareAtPrice?: string | null
  quantity: number
  trackInventory: boolean
  featured: boolean
  featuredImage?: { url: string } | null
  variants?: any[]
}

interface ProductCardProps {
  product: Product
  subdomain: string
}

export function ProductCard({ product, subdomain }: ProductCardProps) {
  const price = Number(product.price)
  const compareAt = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null
  const discount = compareAt
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null
  const inStock = !product.trackInventory || product.quantity > 0
  const hasVariants = product.variants && product.variants.length > 0

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <Link
        to="/s/$subdomain/products/$slug"
        params={{ subdomain, slug: product.slug }}
        className="block"
      >
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.featuredImage ? (
            <img
              src={product.featuredImage.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted via-muted/60 to-muted/30 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="h-14 w-14 rounded-2xl bg-background/60 backdrop-blur-sm border border-border flex items-center justify-center shadow-sm">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground/70 tracking-wide">
                No image
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.featured && (
              <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="h-2.5 w-2.5" /> Featured
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-xs font-semibold text-foreground bg-background border border-border px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick actions — show on hover */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors shadow-sm">
              <Heart className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <Link
          to="/s/$subdomain/products/$slug"
          params={{ subdomain, slug: product.slug }}
        >
          <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Variants pill */}
        {hasVariants && (
          <p className="text-[10px] text-muted-foreground bg-muted rounded-full px-2.5 py-1 inline-block">
            {product.variants!.length} variant
            {product.variants!.length > 1 ? 's' : ''} available
          </p>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-foreground">
              ${price.toFixed(2)}
            </span>
            {compareAt && (
              <span className="text-xs text-muted-foreground line-through">
                ${compareAt.toFixed(2)}
              </span>
            )}
          </div>
          {product.trackInventory && inStock && (
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
              In Stock
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          disabled={!inStock}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  )
}
