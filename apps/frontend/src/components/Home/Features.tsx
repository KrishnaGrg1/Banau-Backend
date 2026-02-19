// components/marketing/Features.tsx

import {
  Globe,
  Lock,
  Settings,
  Palette,
  Zap,
  Cpu,
  LucideIcon,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Feature {
  title: string
  body: string
  icon: LucideIcon
}

interface FeaturesProps {
  features?: Feature[]
  eyebrow?: string
  heading?: string
  subheading?: string
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_FEATURES: Feature[] = [
  {
    title: 'Instant Subdomain',
    icon: Globe,
    body: 'Get yourname.banau.com live in seconds with zero configuration.',
  },
  {
    title: 'Secure Infrastructure',
    icon: Lock,
    body: 'SSL, DDoS protection, and 99.9% uptime SLA included by default.',
  },
  {
    title: 'Powerful Dashboard',
    icon: Settings,
    body: 'Manage products, orders, and customers from one clean interface.',
  },
  {
    title: 'Full Brand Control',
    icon: Palette,
    body: 'Custom colors, logo, and landing page — made entirely yours.',
  },
  {
    title: 'Built for Speed',
    icon: Zap,
    body: 'Edge-optimized storefronts that load in milliseconds globally.',
  },
  {
    title: 'API-First Backend',
    icon: Cpu,
    body: 'Extend anything with our REST API and webhook integrations.',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function Features({
  features = DEFAULT_FEATURES,
  eyebrow = 'Features',
  heading = 'Built for Sellers',
  subheading = 'Everything you need to launch, manage, and grow your online store — packed into one platform.',
}: FeaturesProps) {
  return (
    <section id="features" className="border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 max-w-xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
          {subheading && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {subheading}
            </p>
          )}
        </div>

        {/* Grid — gap-px bg-border creates CSS-only dividers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {features.map((feat) => (
            <FeatureTile key={feat.title} feature={feat} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FeatureTile ───────────────────────────────────────────────────────────────

interface FeatureTileProps {
  feature: Feature
}

export function FeatureTile({ feature }: FeatureTileProps) {
  const Icon = feature.icon
  return (
    <div className="group bg-card p-8 hover:bg-muted/40 transition-colors space-y-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground group-hover:text-foreground transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          {feature.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {feature.body}
        </p>
      </div>
    </div>
  )
}

export default Features
