import { useState } from 'react'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  tenant: {
    name: string
    subdomain: string
  }
  logo?: {
    url: string
  }
}

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Products', href: '#products' },
  { label: 'About', href: '#about' },
]

export default function Header({ tenant, logo }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Brand */}
          <a
            href="#home"
            className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
          >
            {logo?.url ? (
              <img
                src={logo.url}
                alt={tenant.name}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xs font-bold text-primary-foreground">
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  {tenant.name}
                </span>
              </>
            )}
          </a>

          {/* Desktop Nav — centred absolutely */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
