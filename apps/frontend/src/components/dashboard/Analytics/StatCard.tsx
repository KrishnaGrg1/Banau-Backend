import type { StatCardData } from './types'

interface StatCardProps {
  card: StatCardData
  index?: number
}

export function StatCard({ card, index = 0 }: StatCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-5 shadow-sm border transition-shadow bg-background hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Accent top bar */}
      <div
        className="absolute left-0 top-0 h-1 w-full rounded-t-2xl"
        style={{ background: card.accent }}
      />

      <div className="mb-3 text-2xl flex items-center justify-center">
        {card.icon}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide mb-1 text-muted-foreground">
        {card.label}
      </p>

      <p className="text-2xl font-bold leading-none">{card.value}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold
            ${card.positive ? 'bg-accent text-accent-foreground' : 'bg-destructive/10 text-destructive'}`}
        >
          {card.positive ? '↑' : '↓'} {card.delta}
        </span>
        <span className="text-[11px] text-muted-foreground">{card.sub}</span>
      </div>
    </div>
  )
}
