// shared.tsx — reusable UI atoms for all analytics pages

import type { StatCardData, ChartTooltipProps, DateRange } from './types'

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  card: StatCardData
  index?: number
}

export function StatCard({ card, index = 0 }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-sm border bg-background hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="absolute left-0 top-0 h-0.5 w-full"
        style={{ background: card.accent }}
      />
      <div className="mb-3 text-xl">{card.icon}</div>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-1 text-muted-foreground">
        {card.label}
      </p>
      <p className="text-2xl font-bold leading-none">{card.value}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${card.positive ? 'bg-accent text-accent-foreground' : 'bg-destructive/10 text-destructive'}`}
        >
          {card.positive ? '↑' : '↓'} {card.delta}
        </span>
        <span className="text-[11px] text-muted-foreground">{card.sub}</span>
      </div>
    </div>
  )
}

// ── ChartTooltip ──────────────────────────────────────────────────────────────

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-background px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          className="flex items-center gap-2 mb-0.5"
          style={{ color: p.color }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full inline-block"
            style={{ background: p.color }}
          />
          {p.name}:{' '}
          <span className="font-bold">
            {p.name.toLowerCase().includes('revenue') ||
            p.name.toLowerCase().includes('value') ||
            p.name.toLowerCase().includes('spent')
              ? `$${Number(p.value).toLocaleString()}`
              : p.name.toLowerCase().includes('rate')
                ? `${p.value}%`
                : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

// ── DateRangeSelector ─────────────────────────────────────────────────────────

const RANGES: DateRange[] = ['7D', '30D', '90D', '1Y']

interface DateRangeSelectorProps {
  value: DateRange
  onChange: (r: DateRange) => void
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border bg-background p-1 shadow-sm">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
            ${
              value === r
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

// ── Section Card wrapper ──────────────────────────────────────────────────────

interface SectionCardProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm border bg-background ${className}`}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

// ── Page Header ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle: string
  right?: React.ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {eyebrow}
        </p>
        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            letterSpacing: '-0.02em',
          }}
          className="text-4xl font-normal"
        >
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
  COMPLETED: 'bg-accent text-accent-foreground',
  PAID: 'bg-secondary text-secondary-foreground',
  SHIPPED: 'bg-muted text-foreground',
  PENDING: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-destructive/10 text-destructive',
  REFUNDED: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-accent text-accent-foreground',
  DRAFT: 'bg-muted text-muted-foreground',
  ARCHIVED: 'bg-muted text-muted-foreground',
}

export function Badge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_STYLES[label] ?? 'bg-muted text-muted-foreground'}`}
    >
      {label}
    </span>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────

export function Legend({
  items,
}: {
  items: { label: string; color: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-4 mt-3">
      {items.map((i) => (
        <span
          key={i.label}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            className="h-2 w-2 rounded-sm inline-block"
            style={{ background: i.color }}
          />
          {i.label}
        </span>
      ))}
    </div>
  )
}
