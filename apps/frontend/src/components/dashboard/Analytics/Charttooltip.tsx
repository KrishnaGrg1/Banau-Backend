import type { ChartTooltipProps } from './types'

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          className="flex items-center gap-2"
          style={{ color: p.color }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          {p.name}:{' '}
          <span className="font-bold">
            {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}
