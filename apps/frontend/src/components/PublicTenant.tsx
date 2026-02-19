import { Setting, Tenant } from '@repo/db/dist/generated/prisma/client'
import { Button } from './ui/button'
import { Link } from '@tanstack/react-router'
import Header from './ClientComponents/Headers'
import StoreHero from './ClientComponents/StoreHero'
import StoreFooter from './ClientComponents/StoreFooter'
import { Sparkles, AlertCircle, Lock } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col bg-background">
      <Header tenant={tenant} logo={logo ? { url: logo } : undefined} />
      {setting && <StoreHero setting={setting} />}
      <main className="flex-1">
        <StorefrontContent tenant={tenant} />
      </main>
      <StoreFooter tenant={tenant} />
    </div>
  )
}

// ── Storefront content placeholder ────────────────────────────────────────────

function StorefrontContent({ tenant }: { tenant: Tenant }) {
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-muted flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-muted-foreground opacity-30" />
              </div>
              <div className="p-4 space-y-2">
                <div className="h-3 rounded-full bg-muted w-3/4" />
                <div className="h-2.5 rounded-full bg-muted w-1/2" />
                <div className="h-3 rounded-full bg-muted w-1/4 mt-3" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center pt-4">
          Products will appear here once added from your dashboard.
        </p>
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
