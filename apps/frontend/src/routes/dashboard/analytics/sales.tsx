// /dashboard/analytics/sales.tsx  →  Sales Analytics

import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import {
  StatCard,
  ChartTooltip,
  DateRangeSelector,
  DateRange,
} from '@/components/Analytics'

import {
  Badge,
  Legend,
  PageHeader,
  SectionCard,
} from '@/components/Analytics/shared'
import {
  REFUND_DATA,
  SALES_DATA,
  STATS,
  STATUS_DATA,
} from '@/components/Analytics/mockup'

const AVG_LINE_DATA = SALES_DATA.map((d) => ({ ...d, avg: 158.4 }))
import { createFileRoute } from '@tanstack/react-router'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

export const Route = createFileRoute('/dashboard/analytics/sales')({
  component: AnalyticsSales,
})

// ── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsSales() {
  const [range, setRange] = useState<DateRange>('30D')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Sales"
        subtitle="Deep-dive into Order.total, order counts, and refund trends."
        right={<DateRangeSelector value={range} onChange={setRange} />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((card, i) => (
          <StatCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Daily Revenue + Orders dual axis */}
      <SectionCard
        title="Daily Revenue"
        subtitle="SUM(Order.total) and COUNT(Order) per day"
        action={
          <Legend
            items={[
              { label: 'Revenue', color: '#111827' },
              { label: 'Orders', color: '#3b82f6' },
            ]}
          />
        }
      >
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={SALES_DATA}>
            <defs>
              <linearGradient id="sRevG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sOrdG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f1f1"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#111827"
              strokeWidth={2.5}
              fill="url(#sRevG)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="orders"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#sOrdG)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Avg Order Value trend + Refund rate */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Average Order Value"
          subtitle="AVG(Order.total) per day vs target $158.4"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={AVG_LINE_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f1f1"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[140, 180]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine
                y={158.4}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Target',
                  position: 'right',
                  fill: '#f59e0b',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="avgOrderValue"
                name="Avg Order Value"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Refund Trend"
          subtitle="Count of REFUNDED orders and rate %"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REFUND_DATA} barGap={6}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f1f1"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="refunds"
                name="refunds"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rate"
                name="rate"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Orders by Status table */}
      <SectionCard
        title="Revenue by Order Status"
        subtitle="Breakdown of Order.total grouped by OrderStatus enum"
      >
        <div className="overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b border-gray-100">
                {['Status', 'Orders', 'Revenue', '% of Total'].map((h) => (
                  <TableHead
                    key={h}
                    className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              {STATUS_DATA.map((row) => {
                const totalRev = STATUS_DATA.reduce(
                  (a, r) => a + Math.max(r.revenue, 0),
                  0,
                )
                const pct =
                  totalRev > 0
                    ? ((Math.max(row.revenue, 0) / totalRev) * 100).toFixed(1)
                    : '0'
                return (
                  <TableRow
                    key={row.status}
                    className="hover:bg-gray-50/50 TableRowansition-colors"
                  >
                    <TableCell className="py-3">
                      <Badge label={row.status} />
                    </TableCell>
                    <TableCell className="py-3 text-gray-700 font-medium">
                      {row.count}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={`font-semibold ${row.revenue < 0 ? 'text-red-500' : 'text-gray-800'}`}
                      >
                        {row.revenue < 0
                          ? `-$${Math.abs(row.revenue).toLocaleString()}`
                          : `$${row.revenue.toLocaleString()}`}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${pct}%`, background: row.color }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  )
}
