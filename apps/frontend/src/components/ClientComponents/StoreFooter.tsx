import { Tenant } from '@repo/db/dist/generated/prisma/client'

interface StoreFooterProps {
  tenant: Tenant
}

const NAV_LINKS = ['home', 'products', 'about']

const StoreFooter = ({ tenant }: StoreFooterProps) => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold text-primary-foreground">
                  {tenant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-foreground">
                {tenant.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              A modern online store powered by Banau. Discover quality products
              and enjoy a seamless shopping experience.
            </p>
            <a
              href={`mailto:${tenant.email}`}
              className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {tenant.email}
            </a>
          </div>

          {/* Links column */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Navigate
            </p>
            <nav className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link}`}
                  className="text-sm text-muted-foreground capitalize hover:text-foreground transition-colors w-fit"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* Info column */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Store
            </p>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span>Subdomain</span>
                <span className="font-mono text-foreground/70">
                  {tenant.subdomain}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span>Status</span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Published
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            © {year} {tenant.name}. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Powered by{' '}
            <a
              href="https://banau.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Banau
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default StoreFooter
