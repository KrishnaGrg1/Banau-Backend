// components/marketing/Hero.tsx

import { ArrowRight, Check, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HeroDomainPill {
  name: string
  tag: string
}

interface HeroProps {
  headline?: string
  headlineMuted?: string
  subheadline?: string
  domainPills?: HeroDomainPill[]
  trustPoints?: string[]
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PILLS: HeroDomainPill[] = [
  { name: 'cafe.banau.com', tag: 'Food & Bev' },
  { name: 'studio.banau.com', tag: 'Creative' },
  { name: 'drops.banau.com', tag: 'Fashion' },
  { name: 'craft.banau.com', tag: 'Artisan' },
]

const DEFAULT_TRUST = [
  'No credit card required',
  'Live in under 60 seconds',
  'Free plan available',
]

// ── Component ─────────────────────────────────────────────────────────────────

export function Hero({
  headline = 'Launch Your',
  headlineMuted = 'Online Store',
  subheadline = 'Get a fully hosted storefront at yourname.banau.com — no servers, no setup, no stress.',
  domainPills = DEFAULT_PILLS,
  trustPoints = DEFAULT_TRUST,
}: HeroProps) {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: 'hsl(var(--primary))' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="max-w-3xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Now in Open Beta
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] text-foreground">
            {headline}
            <br />
            <span className="text-muted-foreground font-light italic">
              {headlineMuted}
            </span>
            <br />
            in Seconds.
          </h1>

          {/* Sub */}
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              className="rounded-xl px-8 text-base"
              onClick={() => navigate({ to: '/register' })}
            >
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8 text-base"
            >
              View Demo
            </Button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border text-xs text-muted-foreground">
            {trustPoints.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Floating domain pills (desktop only) */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-3">
          {domainPills.map((d, i) => (
            <div
              key={d.name}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm"
              style={{
                transform: `translateX(${i % 2 === 0 ? '0px' : '24px'})`,
              }}
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-mono text-xs font-semibold text-foreground">
                {d.name}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {d.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
