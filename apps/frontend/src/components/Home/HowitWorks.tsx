// components/marketing/HowItWorks.tsx

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Step {
  n: string
  title: string
  body: string
}

interface HowItWorksProps {
  steps?: Step[]
  eyebrow?: string
  heading?: string
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_STEPS: Step[] = [
  {
    n: '01',
    title: 'Register',
    body: 'Create your account in under 30 seconds. No credit card required to start.',
  },
  {
    n: '02',
    title: 'Choose Your Name',
    body: 'Pick a unique subdomain that becomes your store address at yourname.banau.com.',
  },
  {
    n: '03',
    title: 'Go Live Instantly',
    body: 'Your store is live the moment you publish. Share the link and start selling.',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function HowItWorks({
  steps = DEFAULT_STEPS,
  eyebrow = 'Process',
  heading = 'How It Works',
}: HowItWorksProps) {
  return (
    <section id="how-it-works" className="border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 max-w-xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {heading}
          </h2>
        </div>

        {/* Step panels */}
        <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-2xl overflow-hidden">
          {steps.map((step, i) => (
            <StepPanel key={step.n} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── StepPanel ─────────────────────────────────────────────────────────────────

interface StepPanelProps {
  step: Step
  index: number
}

export function StepPanel({ step, index }: StepPanelProps) {
  return (
    <div className="p-8 md:p-10 space-y-6 bg-card hover:bg-muted/40 transition-colors">
      <div className="flex items-start justify-between">
        <span className="text-5xl font-bold text-muted-foreground/20 leading-none select-none">
          {step.n}
        </span>
        <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
          {index + 1}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.body}
        </p>
      </div>
    </div>
  )
}

export default HowItWorks
