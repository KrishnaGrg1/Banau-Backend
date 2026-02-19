// components/marketing/Pricing.tsx

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PricingPlan {
  name: string
  price: string
  desc: string
  features: string[]
  popular?: boolean
}

interface PricingProps {
  plans?: PricingPlan[]
  eyebrow?: string
  heading?: string
  subheading?: string
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_PLANS: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$9',
    desc: 'Perfect for new sellers.',
    features: ['1 Store', 'Basic Analytics', 'Email Support', 'Custom Domain'],
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    desc: 'Everything you need to grow.',
    features: [
      'Unlimited Stores',
      'Advanced Analytics',
      'Priority Support',
      'API Access',
      'Custom Domain',
    ],
    popular: true,
  },
  {
    name: 'Business',
    price: '$99',
    desc: 'For teams and agencies.',
    features: [
      'Everything in Pro',
      'White Label',
      'Dedicated Support',
      'Custom Integrations',
      'SLA Guarantee',
    ],
    popular: false,
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function Pricing({
  plans = DEFAULT_PLANS,
  eyebrow = 'Pricing',
  heading = 'Simple, Transparent Pricing',
  subheading = 'No hidden fees. Cancel any time. Start free.',
}: PricingProps) {
  return (
    <section id="pricing" className="border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
          {subheading && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {subheading}
            </p>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── PlanCard ──────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: PricingPlan
}

export function PlanCard({ plan }: PlanCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className={`rounded-2xl border p-8 flex flex-col gap-8 transition-all ${
        plan.popular
          ? 'border-primary/40 bg-card ring-1 ring-primary/20 shadow-lg'
          : 'border-border bg-card'
      }`}
    >
      {/* Header */}
      <div className="space-y-3">
        {plan.popular && (
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wide">
            Most Popular
          </span>
        )}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
        </div>
        <div className="flex items-end gap-1 pt-1">
          <span className="text-4xl font-bold text-foreground">
            {plan.price}
          </span>
          <span className="text-sm text-muted-foreground mb-1">/mo</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2.5 text-sm text-foreground"
          >
            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        className="w-full rounded-xl"
        variant={plan.popular ? 'default' : 'outline'}
        onClick={() => navigate({ to: '/register' })}
      >
        Get Started
      </Button>
    </div>
  )
}

export default Pricing
