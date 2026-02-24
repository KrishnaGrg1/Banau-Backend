// components/marketing/Nav.tsx

import { useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { useNavigate } from '@tanstack/react-router'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string
  href: string
}

interface NavProps {
  links?: NavLink[]
  brandName?: string
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_LINKS: NavLink[] = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  // { label: 'Pricing', href: '#pricing' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function Nav({ links = DEFAULT_LINKS, brandName = 'Banau' }: NavProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <a
          href="/"
          className="text-xl flex flex-row items-center font-bold tracking-tight text-foreground select-none"
        >
          <img src="logo.png" className="h-10" />
          {brandName}
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => navigate({ to: '/login' })}
          >
            Log in
          </Button>
          <Button
            size="sm"
            className="rounded-lg"
            onClick={() => navigate({ to: '/register' })}
          >
            Get Started
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>

          {/* Mobile toggle */}
          <button
            className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="h-px bg-border my-2" />
            <button
              onClick={() => navigate({ to: '/login' })}
              className="rounded-lg px-3 py-2.5 text-sm text-left text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Nav
