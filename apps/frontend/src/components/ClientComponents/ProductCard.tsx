import { Asset, Product } from '@repo/db/dist/generated/prisma/client'
import { ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  product: Product
  asset: Asset
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    price,
  )

const ProductCard = ({ product, asset }: ProductCardProps) => {
  const hasDiscount =
    typeof product.compareAtPrice === 'number' &&
    Number(product.compareAtPrice) > Number(product.price)
  const discountPercent =
    hasDiscount && typeof product.compareAtPrice === 'number'
      ? Math.round(
          ((product.compareAtPrice - Number(product.price)) /
            product.compareAtPrice) *
            100,
        )
      : 0

  // Map status to badge variant
  const statusMap = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    ACTIVE: { label: 'Active', variant: 'default' },
    ARCHIVED: { label: 'Archived', variant: 'outline' },
  } as const

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex flex-col gap-2 p-3 flex-1">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md mb-2">
          {product.featuredImageId ? (
            <img
              src={asset.url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-10 w-10" />
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
          <Badge
            variant={statusMap[product.status].variant}
            className="uppercase tracking-wide text-[10px] px-2 py-0.5 rounded"
          >
            {statusMap[product.status].label}
          </Badge>
        </div>
        {product.description && (
          <div className="text-sm flex-1 line-clamp-2 mb-1">
            {product.description}
          </div>
        )}
        <div className="flex items-end gap-2 mt-1">
          <span className="font-bold text-lg">
            {formatPrice(Number(product.price))}
          </span>
          {hasDiscount && (
            <span className="line-through text-sm">
              {formatPrice(Number(product.compareAtPrice!))}
            </span>
          )}
        </div>
        <div className="text-xs mt-0.5">
          {product.quantity > 0
            ? `${product.quantity} in stock`
            : 'Out of stock'}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            asChild
            size="sm"
            className="rounded px-3 py-1 text-xs font-medium"
          >
            <a href={`/products/${product.slug}`}>View</a>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded px-3 py-1 text-xs font-medium"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductCard
