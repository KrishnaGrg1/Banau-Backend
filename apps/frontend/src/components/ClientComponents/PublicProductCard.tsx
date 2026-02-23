import { ProductDto } from '@repo/shared'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

interface PublicProductCardProps {
  product: ProductDto
}

function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

export default function PublicProductCard({ product }: PublicProductCardProps) {
  const price = Number(product.price)
  const compareAtPrice = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null

  const hasDiscount = compareAtPrice !== null && compareAtPrice > price
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0

  return (
    <Link
      to="$slug"
      params={{ slug: product.slug }}
      className="block h-full focus:outline-none"
    >
      <Card className="flex flex-col h-full border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-2 p-3 flex-1">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md mb-2 bg-muted">
            {product.featuredImage.url ? (
              <img
                src={product.featuredImage.url}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Sparkles className="h-10 w-10 text-muted-foreground opacity-30" />
              </div>
            )}
            {hasDiscount && (
              <Badge
                className="absolute left-2 top-2 text-xs px-2 py-1 rounded"
                variant="default"
              >
                -{discountPercent}%
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 min-h-[2.2rem]">
            <span className="font-semibold text-base flex-1 line-clamp-2">
              {product.name}
            </span>
          </div>

          {product.description && (
            <div className="text-sm flex-1 line-clamp-2 mb-1 text-muted-foreground">
              {product.description}
            </div>
          )}

          <div className="flex items-end gap-2 mt-1">
            <span className="font-bold text-lg">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="line-through text-sm text-muted-foreground">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>

          {'quantity' in product && product.quantity !== undefined && (
            <div className="text-xs mt-0.5">
              {product.quantity > 0
                ? `${product.quantity} in stock`
                : 'Out of stock'}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
