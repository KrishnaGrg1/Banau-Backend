import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { CustomerGrowthDataPoint } from './types'
import { ChartTooltip } from './Charttooltip'

interface CustomerGrowthChartProps {
  data: CustomerGrowthDataPoint[]
}

export function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  return (
    <div className="rounded-2xl p-6 shadow-sm border bg-background">
      <h2 className="text-base font-semibold mb-1">Customer Growth</h2>
      <p className="text-xs text-muted-foreground mb-5">New vs Returning</p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={3}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-border"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="new"
            name="New"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="returning"
            name="Returning"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" />
          New
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent inline-block" />
          Returning
        </span>
      </div>
    </div>
  )
}
