import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Mail, Globe, Package, Star, Clock, ArrowRight } from 'lucide-react'

const parentRoute = getRouteApi('/s/$subdomain')

export const Route = createFileRoute('/s/$subdomain/about')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = parentRoute.useLoaderData()
  const tenant = data?.existingTenant

  const stats = [
    { label: 'Products', value: '100+', icon: Package },
    { label: 'Happy Customers', value: '2k+', icon: Star },
    { label: 'Years Active', value: '3+', icon: Clock },
  ]

  const storeInfo = [
    { label: 'Store Name', value: tenant?.name },
    { label: 'Subdomain', value: tenant?.subdomain, mono: true },
    { label: 'Contact', value: tenant?.email },
    { label: 'Status', value: 'Published', highlight: true },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          About Us
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          We are <span className="text-primary">{tenant?.name}</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed text-base">
          Welcome to {tenant?.name}. We're passionate about bringing you the
          best products with a seamless shopping experience. Built on Banau — a
          modern platform for stores that mean business.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Verified Store
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-8 text-center space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Story + Info ───────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
        {/* Left — Story */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Our Story
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Built with purpose
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {tenant?.name} was founded with a simple belief — great products
              should be easy to find and even easier to buy. We've curated
              everything in our catalogue with care, quality, and our customers
              in mind.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Powered by Banau, our store is built for speed, reliability, and a
              modern shopping experience that works on any device.
            </p>
          </div>

          {/* Contact pills */}
          <div className="space-y-3">
            {tenant?.email && (
              <a
                href={`mailto:${tenant.email}`}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                {tenant.email}
              </a>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <Globe className="h-4 w-4" />
              </div>
              <span className="font-mono text-xs">
                {tenant?.subdomain}.banau.com
              </span>
            </div>
          </div>
        </div>
        {/* Right — Store Info Card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Store Info
            </p>
          </div>
          <div className="p-6 space-y-1">
            {storeInfo.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
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
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-[11px] text-muted-foreground text-center">
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
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card p-12 text-center space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Ready to shop?
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Browse our full catalogue and find something you'll love.
        </p>
        <a
          href="./products"
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          View All Products
          <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  )
}
