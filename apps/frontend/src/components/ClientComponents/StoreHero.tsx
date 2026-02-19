import { Setting } from '@repo/db/dist/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

interface StoreHeroProps {
  setting: Setting
}

const StoreHero = ({ setting }: StoreHeroProps) => {
  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-border bg-background py-20 sm:py-28 lg:py-36"
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Soft radial glow — uses primary color via CSS variable, no hardcoded color */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[500px] w-[700px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: 'hsl(var(--primary))' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Now Open
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.08]">
            {setting.landingPageTitle}
          </h1>

          {/* Description */}
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
            {setting.landingPageDescription}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button asChild size="lg" className="rounded-xl px-8">
              <a href="#products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-8"
            >
              <a href="#about">Learn More</a>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
            {['Free Shipping', 'Secure Checkout', 'Easy Returns'].map(
              (badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {badge}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoreHero
