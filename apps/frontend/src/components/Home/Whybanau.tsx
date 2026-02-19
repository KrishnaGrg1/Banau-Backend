// components/marketing/WhyBanau.tsx

import { Check } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface WhyBanauProps {
  eyebrow?: string
  heading?: string
  oldWayItems?: string[]
  newWayItems?: string[]
  oldWayTime?: string
  newWayTime?: string
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_OLD = [
  'Buy a domain',
  'Configure DNS records',
  'Set up hosting server',
  'Install a CMS',
  'Maintain & update server',
  'Debug SSL issues',
]

const DEFAULT_NEW = [
  'Create your account',
  'Pick your subdomain',
  'Customize your store',
  'Click Publish — done',
]

// ── Component ─────────────────────────────────────────────────────────────────

export function WhyBanau({
  eyebrow = 'Comparison',
  heading = 'Why Banau?',
  oldWayItems = DEFAULT_OLD,
  newWayItems = DEFAULT_NEW,
  oldWayTime = '3–5 days',
  newWayTime = 'Under 60 seconds',
}: WhyBanauProps) {
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Old way */}
          <OldWayCard items={oldWayItems} setupTime={oldWayTime} />
          {/* Banau way */}
          <BanauWayCard items={newWayItems} setupTime={newWayTime} />
        </div>
      </div>
    </section>
  )
}

// ── OldWayCard ────────────────────────────────────────────────────────────────

interface OldWayCardProps {
  items: string[]
  setupTime: string
}

export function OldWayCard({ items, setupTime }: OldWayCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          The Old Way
        </p>
        <h3 className="text-xl font-semibold text-foreground">
          Traditional Hosting
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 text-sm text-muted-foreground"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs shrink-0">
              ✕
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        Average setup time:{' '}
        <span className="font-semibold text-foreground">{setupTime}</span>
      </div>
    </div>
  )
}

// ── BanauWayCard ──────────────────────────────────────────────────────────────

interface BanauWayCardProps {
  items: string[]
  setupTime: string
}

export function BanauWayCard({ items, setupTime }: BanauWayCardProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-8 space-y-6 ring-1 ring-primary/10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          The Banau Way
        </p>
        <h3 className="text-xl font-semibold text-foreground">
          Launch in Minutes
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 text-sm text-foreground"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs shrink-0">
              <Check className="h-3 w-3" />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground">
        Average setup time:{' '}
        <span className="font-semibold text-primary">{setupTime}</span>
      </div>
    </div>
  )
}

export default WhyBanau
