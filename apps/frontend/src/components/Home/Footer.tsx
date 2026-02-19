// components/marketing/Footer.tsx
// All footer sub-components for the Banau marketing homepage

import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { useNavigate } from '@tanstack/react-router'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterLink {
  label: string
  href: string
}

// ── Data (default columns) ────────────────────────────────────────────────────

export const DEFAULT_FOOTER_COLS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Security', href: '#security' },
      { label: 'Changelog', href: '#changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
      { label: 'Press', href: '#press' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' },
      { label: 'Cookies', href: '#cookies' },
      { label: 'Contact', href: '#contact' },
    ],
  },
]

// ── FooterBrand ───────────────────────────────────────────────────────────────
// Logo / wordmark + short tagline column

interface FooterBrandProps {
  name?: string
  tagline?: string
}

export function FooterBrand({
  name = 'Banau',
  tagline = 'The instant storefront builder for independent sellers.',
}: FooterBrandProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center ">
        <img src="logo.png" className="h-12" />
        <p className="text-xl font-bold text-foreground tracking-tight">
          {name}
        </p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        {tagline}
      </p>
    </div>
  )
}

// ── FooterNav ─────────────────────────────────────────────────────────────────
// A single nav column (title + list of links)

interface FooterNavProps {
  column: FooterColumn
}

export function FooterNav({ column }: FooterNavProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {column.title}
      </p>
      <ul className="space-y-2.5">
        {column.links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── FooterBottom ──────────────────────────────────────────────────────────────
// Bottom bar: copyright + mode toggle + auth buttons

interface FooterBottomProps {
  companyName?: string
  onLogin?: () => void
  onSignUp?: () => void
}

export function FooterBottom({
  companyName = 'Banau',
  onLogin,
  onSignUp,
}: FooterBottomProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-8">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} {companyName}. All rights reserved.
      </p>
      <div className="flex items-center gap-2">
        <ModeToggle />
        {onLogin && (
          <Button size="sm" variant="ghost" onClick={onLogin}>
            Log in
          </Button>
        )}
        {onSignUp && (
          <Button size="sm" className="rounded-lg" onClick={onSignUp}>
            Sign Up Free
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Footer (assembled) ────────────────────────────────────────────────────────
// Drop-in full footer — composes all sub-components

interface FooterProps {
  columns?: FooterColumn[]
  brandName?: string
  brandTagline?: string
  companyName?: string
}

export function Footer({
  columns = DEFAULT_FOOTER_COLS,
  brandName,
  brandTagline,
  companyName,
}: FooterProps) {
  const navigate = useNavigate()

  return (
    <footer className="py-16 px-4 border-t border-border">
      <div className="mx-auto max-w-7xl">
        {/* Top grid: brand + nav columns */}
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <FooterBrand name={brandName} tagline={brandTagline} />
          {columns.map((col) => (
            <FooterNav key={col.title} column={col} />
          ))}
        </div>

        {/* Bottom bar */}
        <FooterBottom
          companyName={companyName}
          onLogin={() => navigate({ to: '/login' })}
          onSignUp={() => navigate({ to: '/register' })}
        />
      </div>
    </footer>
  )
}

// ── Default export ────────────────────────────────────────────────────────────
export default Footer
