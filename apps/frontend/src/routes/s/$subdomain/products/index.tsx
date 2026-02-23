import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  usePublicProducts,
  useSearchProducts,
} from '@/hooks/use-public-product'
import { ProductCard } from '@/components/ClientComponents/ProductCard'
import {
  Search,
  X,
  SlidersHorizontal,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { SortBy } from '@/lib/services/public-product-services'
import { Button } from '@/components/ui/button'

const parentRoute = getRouteApi('/s/$subdomain')

export const Route = createFileRoute('/s/$subdomain/products/')({
  component: ShopPage,
})

const LIMITS = [12, 24, 48]

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
]

function ShopPage() {
  const { data } = parentRoute.useLoaderData()
  const tenant = data?.existingTenant

  // ── Filter state ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  const debounceSearch = useDebouncedCallback((v: string) => {
    setDebouncedQ(v)
    setPage(1)
  }, 400)
  const debounceMin = useDebouncedCallback((v: number | undefined) => {
    setMinPrice(v)
    setPage(1)
  }, 600)
  const debounceMax = useDebouncedCallback((v: number | undefined) => {
    setMaxPrice(v)
    setPage(1)
  }, 600)

  const isSearching = debouncedQ.trim().length > 0

  // ── Queries ─────────────────────────────────────────────
  const { data: searchData, isLoading: searchLoading } = useSearchProducts({
    subdomain: tenant?.subdomain ?? '',
    q: debouncedQ,
    page,
    limit,
  })

  const { data: productsData, isLoading: productsLoading } = usePublicProducts({
    subdomain: tenant?.subdomain ?? '',
    page,
    limit,
    sortBy,
    inStockOnly,
    minPrice,
    maxPrice,
  })

  const activeData = isSearching ? searchData : productsData
  const isLoading = isSearching ? searchLoading : productsLoading
  const products = activeData?.products ?? []
  const pagination = activeData?.pagination
  const totalPages = pagination?.pages ?? 1

  // ── Helpers ─────────────────────────────────────────────
  const resetFilters = () => {
    setSortBy('newest')
    setInStockOnly(false)
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setPage(1)
  }

  const hasActiveFilters =
    sortBy !== 'newest' ||
    inStockOnly ||
    minPrice !== undefined ||
    maxPrice !== undefined

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Catalogue
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            All Products
          </h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              {pagination?.total ?? 0} product
              {pagination?.total !== 1 ? 's' : ''}
              {isSearching && ` for "${debouncedQ}"`}
            </p>
          )}
        </div>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by name, description, SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              debounceSearch(e.target.value)
            }}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
          {searchQuery && (
            <Button
              onClick={() => {
                setSearchQuery('')
                setDebouncedQ('')
                setPage(1)
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Per page */}
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value))
            setPage(1)
          }}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        >
          {LIMITS.map((l) => (
            <option key={l} value={l}>
              {l} per page
            </option>
          ))}
        </select>

        {/* Filter toggle */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors relative ${
            showFilters || hasActiveFilters
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Sort */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Sort By
              </p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value)
                      setPage(1)
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      sortBy === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Availability
              </p>
              <div className="flex gap-2">
                {[
                  { label: 'All', value: false },
                  { label: 'In Stock', value: true },
                ].map((opt) => (
                  <Button
                    key={opt.label}
                    onClick={() => {
                      setInStockOnly(opt.value)
                      setPage(1)
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      inStockOnly === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Price Range
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min={0}
                  defaultValue={minPrice}
                  onChange={(e) =>
                    debounceMin(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full rounded-lg border border-border bg-muted px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-muted-foreground text-xs shrink-0">
                  –
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  min={0}
                  defaultValue={maxPrice}
                  onChange={(e) =>
                    debounceMax(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full rounded-lg border border-border bg-muted px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <div className="flex justify-end border-t border-border pt-4">
              <Button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
              >
                Reset all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-muted flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-3 rounded-full bg-muted w-3/4" />
                <div className="h-2.5 rounded-full bg-muted w-1/2" />
                <div className="h-8 rounded-xl bg-muted w-full mt-2" />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {isSearching ? 'No results found' : 'No products found'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isSearching
                  ? `No products match "${debouncedQ}"`
                  : hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Check back soon — new items are on the way.'}
              </p>
            </div>
            {(isSearching || hasActiveFilters) && (
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setDebouncedQ('')
                  resetFilters()
                }}
                className="text-xs text-primary underline underline-offset-2"
              >
                Clear all
              </Button>
            )}
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              subdomain={tenant?.subdomain ?? ''}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            if (
              p === 1 ||
              p === totalPages ||
              (p >= page - 1 && p <= page + 1)
            ) {
              return (
                <Button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-9 w-9 rounded-xl border text-xs font-medium transition-colors ${
                    p === page
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </Button>
              )
            }
            if (p === page - 2 || p === page + 2) {
              return (
                <span key={p} className="text-muted-foreground text-xs">
                  …
                </span>
              )
            }
            return null
          })}

          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
