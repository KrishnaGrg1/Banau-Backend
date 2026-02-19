// components/marketing/Domains.tsx

import { Globe } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DomainExample {
  name: string
  label: string
  tag: string
}

interface DomainsProps {
  domains?: DomainExample[]
  eyebrow?: string
  heading?: string
  subheading?: string
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_DOMAINS: DomainExample[] = [
  { name: 'cafe.banau.com', label: 'Coffee Shop', tag: 'Food & Bev' },
  { name: 'studio.banau.com', label: 'Design Studio', tag: 'Creative' },
  { name: 'drops.banau.com', label: 'Streetwear Brand', tag: 'Fashion' },
  { name: 'craft.banau.com', label: 'Handmade Goods', tag: 'Artisan' },
  { name: 'pixel.banau.com', label: 'Digital Products', tag: 'Tech' },
  { name: 'garden.banau.com', label: 'Plant Nursery', tag: 'Lifestyle' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function Domains({
  domains = DEFAULT_DOMAINS,
  eyebrow = 'Examples',
  heading = 'Your Store Awaits',
  subheading = "See what's possible on Banau.",
}: DomainsProps) {
  return (
    <section className="border-b border-border py-24 overflow-hidden">
      {/* Section header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          {heading}
        </h2>
        {subheading && (
          <p className="text-sm text-muted-foreground">{subheading}</p>
        )}
      </div>

      {/* Full-bleed grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y border-border">
        {domains.map((d) => (
          <DomainTile key={d.name} domain={d} />
        ))}
      </div>
    </section>
  )
}

// ── DomainTile ────────────────────────────────────────────────────────────────

interface DomainTileProps {
  domain: DomainExample
}

export function DomainTile({ domain }: DomainTileProps) {
  return (
    <div className="group bg-card px-8 py-10 hover:bg-muted/40 transition-colors flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground group-hover:text-foreground transition-colors">
          <Globe className="h-4 w-4" />
        </div>
        <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {domain.tag}
        </span>
      </div>
      <div>
        <p className="font-mono text-sm font-semibold text-foreground">
          {domain.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{domain.label}</p>
      </div>
    </div>
  )
}

export default Domains
