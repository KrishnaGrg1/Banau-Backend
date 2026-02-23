import { Setting, Tenant } from '@repo/db/dist/generated/prisma/client'
import { Button } from './ui/button'
import { Link } from '@tanstack/react-router'
import StoreHero from './ClientComponents/StoreHero'
import {
  Sparkles,
  AlertCircle,
  Lock,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'
import { usePublicProducts } from '@/hooks/use-public-product'

interface PublicTenantProps {
  tenant?: Tenant | null
  setting?: Setting | null
  logo?: string | null
}

export function PublicTenant({ tenant, setting, logo }: PublicTenantProps) {
  const isSubdomain =
    typeof window !== 'undefined' &&
    window.location.hostname.includes('.localhost') &&
    !window.location.hostname.startsWith('www.')

  const dashboardUrl = isSubdomain
    ? `http://localhost:3000/dashboard`
    : '/dashboard'
  const { data, isLoading } = usePublicProducts(
    tenant?.subdomain ? { subdomain: tenant.subdomain } : { subdomain: '' },
  )

  const products = data?.products ?? []
  // ── Not found ──────────────────────────────────────────────────────────────
  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Website Not Found
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This website does not exist or has not been published yet.
            </p>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mt-3">
              Powered by{' '}
              <a
                href="https://banau.com"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Banau
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Unpublished ───────────────────────────────────────────────────────────
  if (!tenant.published) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <Lock className="h-9 w-9 text-muted-foreground" />
          </div>

          {/* Copy */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Coming Soon
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {tenant.name}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              This store is currently under construction. Check back soon —
              something great is coming.
            </p>
          </div>

          {/* Details pill */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted/40 px-5 py-2.5 text-xs">
            <span className="text-muted-foreground">Subdomain:</span>
            <span className="font-semibold text-foreground font-mono">
              {tenant.subdomain}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="text-muted-foreground">Status:</span>
            <span className="font-semibold text-foreground">Unpublished</span>
          </div>

          {/* Owner CTA */}
          <div className="pt-2 space-y-3">
            <p className="text-xs text-muted-foreground">
              Are you the owner of this website?
            </p>
            {isSubdomain ? (
              <Button asChild size="sm">
                <a href={dashboardUrl}>Go to Dashboard</a>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <a
              href="https://banau.com"
              className="underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Banau
            </a>
          </p>
        </div>
      </div>
    )
  }

  // ── Published ─────────────────────────────────────────────────────────────
  return (
    <>
      {setting && <StoreHero setting={setting} />}
      <StorefrontContent
        tenant={tenant}
        products={Array.isArray(products) ? products : []}
        isLoading={isLoading}
      />
    </>
  )
}

// ── Storefront content placeholder ────────────────────────────────────────────

function StorefrontContent({
  tenant,
  products,
  isLoading,
}: {
  tenant: Tenant
  products: any[]
  isLoading: boolean
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Products section placeholder */}
      <section id="products" className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Catalogue
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Our Products
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            // Skeleton Loading
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  <Sparkles className="h-8 w-8 text-muted-foreground opacity-30" />
                  <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest bg-background/80 backdrop-blur-sm border border-border text-muted-foreground px-2.5 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded-full bg-muted w-3/4" />
                  <div className="h-2.5 rounded-full bg-muted w-1/2" />
                  <div className="h-3 rounded-full bg-muted w-1/4 mt-3" />
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
              No products available yet.
            </div>
          ) : (
            // Actual Products
            products.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {product.featuredImage ? (
                    <img
                      src={product.featuredImage.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted via-muted/60 to-muted/30 relative overflow-hidden">
                      {/* Decorative blobs */}
                      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

                      {/* Icon */}
                      <div className="h-14 w-14 rounded-2xl bg-background/60 backdrop-blur-sm border border-border flex items-center justify-center shadow-sm">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>

                      {/* Label */}
                      <span className="text-[11px] font-medium text-muted-foreground/70 tracking-wide">
                        No image
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-semibold text-sm">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${Number(product.compareAtPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.trackInventory && (
                    <div className="pt-1">
                      {product.quantity > 0 ? (
                        <span className="text-xs text-emerald-600 font-medium">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-xs text-destructive font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {products.length > 0 && (
            <div className="col-span-full flex justify-center pt-6">
              <Link
                to="/s/$subdomain/products"
                params={{ subdomain: tenant.subdomain }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-muted px-6 py-2.5 text-sm font-medium text-foreground transition-colors"
              >
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About section */}
      <section id="about" className="border-t border-border pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                About Us
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {tenant.name}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to {tenant.name}. This store is powered by Banau — a
              modern platform for building and managing online stores with ease.
              Customize this page from your admin dashboard.
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Verified Store
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="font-mono">{tenant.subdomain}.banau.com</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Store Info
            </p>
            {[
              { label: 'Store Name', value: tenant.name },
              { label: 'Subdomain', value: tenant.subdomain, mono: true },
              { label: 'Contact', value: tenant.email },
              { label: 'Status', value: 'Published', highlight: true },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <span className="text-xs text-muted-foreground">
                  {row.label}
                </span>
                <span
                  className={[
                    'text-xs font-medium',
                    row.mono
                      ? 'font-mono text-foreground/70'
                      : 'text-foreground',
                    row.highlight ? 'text-primary' : '',
                  ].join(' ')}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
