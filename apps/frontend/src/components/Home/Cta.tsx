// components/marketing/CTA.tsx

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CTAProps {
  heading?: string
  headingMuted?: string
  subheading?: string
  primaryLabel?: string
  secondaryLabel?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CTA({
  heading = 'Ready to',
  headingMuted = 'Launch?',
  subheading = 'Join thousands of creators, merchants, and entrepreneurs already building on Banau.',
  primaryLabel = 'Create Your Store Now',
  secondaryLabel = 'See a Demo',
}: CTAProps) {
  const navigate = useNavigate()

  return (
    <section className="border-b border-border py-32 relative overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[400px] w-[600px] rounded-full opacity-[0.05] blur-3xl"
          style={{ background: 'hsl(var(--primary))' }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center space-y-8">
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
          {heading}
          <br />
          <span className="text-muted-foreground font-light italic">
            {headingMuted}
          </span>
        </h2>

        <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {subheading}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="rounded-xl px-10 text-base"
            onClick={() => navigate({ to: '/register' })}
          >
            {primaryLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {secondaryLabel && (
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8 text-base"
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

export default CTA
