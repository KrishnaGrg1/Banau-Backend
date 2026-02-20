import {
  ChartTooltip,
  DateRange,
  DateRangeSelector,
  StatCard,
} from '@/components/Analytics'
import {
  BEHAVIOR_RADAR,
  GROWTH_DATA,
  LOCATIONS,
  RETENTION_DATA,
  SEGMENTS,
  STATS,
  TOP_CUSTOMERS,
} from '@/components/Analytics/mockup'
import { Legend, PageHeader, SectionCard } from '@/components/Analytics/shared'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { createFileRoute } from '@tanstack/react-router'
// /dashboard/analytics/customers.tsx  →  Customer Analytics

import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ── Mock data ────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/dashboard/analytics/customers')({
  component: AnalyticsCustomers,
})

// ── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsCustomers() {
  const [range, setRange] = useState<DateRange>('30D')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Customers"
        subtitle="Understand your Customer model — growth, retention, LTV, and segments."
        right={<DateRangeSelector value={range} onChange={setRange} />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((card, i) => (
          <StatCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Growth + Retention */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Customer Growth"
          subtitle="New registrations vs returning purchasers per month"
          action={
            <Legend
              items={[
                { label: 'New', color: '#8b5cf6' },
                { label: 'Returning', color: '#c4b5fd' },
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={GROWTH_DATA}>
              <defs>
                <linearGradient id="cNewG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cRetG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c4b5fd" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="new"
                name="New"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#cNewG)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="returning"
                name="Returning"
                stroke="#c4b5fd"
                strokeWidth={2}
                fill="url(#cRetG)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Retention Curve"
          subtitle="% of customers still active over cohort months"
          action={
            <Legend
              items={[
                { label: 'Retained', color: '#10b981' },
                { label: 'Churned', color: '#ef4444' },
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RETENTION_DATA} stackOffset="expand">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f1f1"
                vertical={false}
              />
              <XAxis
                dataKey="cohort"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                content={<ChartTooltip />}
                formatter={(v) => [`${v}%`]}
              />
              <Bar
                dataKey="retained"
                name="Retained"
                stackId="a"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="churned"
                name="Churned"
                stackId="a"
                fill="#fca5a5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Segments + Behavior Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard
          className="lg:col-span-3"
          title="Customer Segments"
          subtitle="RFM-based grouping — Champions to Lost customers"
        >
          <div className="space-y-3 mt-1">
            {SEGMENTS.map((seg) => {
              const maxCount = SEGMENTS[0].count
              return (
                <div key={seg.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: seg.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {seg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400">
                        {seg.count} customers
                      </span>
                      <span className="font-semibold text-gray-700">
                        ${seg.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(seg.count / maxCount) * 100}%`,
                        background: seg.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard
          className="lg:col-span-2"
          title="Behavior Radar"
          subtitle="Customer engagement scores across key metrics"
        >
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart
              data={BEHAVIOR_RADAR}
              cx="50%"
              cy="50%"
              outerRadius={75}
            >
              <PolarGrid stroke="#f1f1f1" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 9, fill: '#9ca3af' }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Top Customers */}
      <div className="rounded-2xl shadow-sm border bg-background overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-sm font-semibold">
            Top Customers by Lifetime Value
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranked by Customer.totalSpent — from your Customer model
          </p>
        </div>
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-muted border-b">
              {['Customer', 'Email', 'Orders', 'Total Spent', 'Last Order'].map(
                (h) => (
                  <TableHead
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {h}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-muted">
            {TOP_CUSTOMERS.map((c, i) => (
              <TableRow
                key={c.id}
                className="hover:bg-muted/60 transition-colors"
              >
                <TableCell className="px-6 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-background shrink-0"
                      style={{
                        background: [
                          'var(--primary)',
                          'var(--accent)',
                          'var(--secondary)',
                          'var(--warning)',
                          'var(--destructive)',
                        ][i],
                      }}
                    >
                      {c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3 text-muted-foreground text-xs">
                  {c.email}
                </TableCell>
                <TableCell className="px-6 py-3">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {c.orders}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-3 font-semibold">
                  ${c.totalSpent.toLocaleString()}
                </TableCell>
                <TableCell className="px-6 py-3 text-xs text-muted-foreground">
                  {c.lastOrder}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Locations */}
      <SectionCard
        title="Customers by Location"
        subtitle="Aggregated from Customer model — country distribution"
      >
        <div className="space-y-2.5 mt-1">
          {LOCATIONS.map((loc, i) => {
            const maxC = LOCATIONS[0].customers
            const colors = [
              '#8b5cf6',
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ec4899',
              '#14b8a6',
              '#9ca3af',
            ]
            return (
              <div key={loc.country} className="flex items-center gap-3">
                <span className="w-24 text-xs font-medium text-gray-600 shrink-0">
                  {loc.country}
                </span>
                <div className="flex-1 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(loc.customers / maxC) * 100}%`,
                      background: colors[i],
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">
                  {loc.customers} customers
                </span>
                <span className="text-xs font-semibold text-gray-700 w-16 text-right">
                  ${loc.revenue.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
