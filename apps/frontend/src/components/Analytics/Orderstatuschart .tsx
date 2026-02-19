import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { OrderStatusDataPoint } from './types'

interface OrderStatusChartProps {
  data: OrderStatusDataPoint[]
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  return (
    <div className="rounded-2xl p-6 shadow-sm border bg-background">
      <h2 className="text-base font-semibold mb-1">Order Status</h2>
      <p className="text-xs text-muted-foreground mb-4">
        All-time distribution
      </p>

      {/* Donut */}
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number, n: string) => [v, n]} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 space-y-2">
        {data.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-muted-foreground">{s.name}</span>
            </div>
            <span className="font-semibold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
