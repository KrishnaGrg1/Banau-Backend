import { createFileRoute } from '@tanstack/react-router'
import {
  StatCard,
  ChartTooltip,
  DateRangeSelector,
  SectionCard,
  PageHeader,
  Badge,
  Legend,
} from '@/components/Analytics/shared'

// /dashboard/analytics/products.tsx  →  Product Analytics

import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DateRange } from '@/components/Analytics'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  PRODUCTS,
  STATUS_BREAKDOWN,
  STOCK_COLORS,
  STOCK_LEVELS,
  STATS,
  PRODUCT_LINES,
  REVENUE_TREND,
} from '@/components/Analytics/mockup'

export const Route = createFileRoute('/dashboard/analytics/products')({
  component: AnalyticsProducts,
})

// ── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsProducts() {
  const [range, setRange] = useState<DateRange>('30D')
  const [sortBy, setSortBy] = useState<'unitsSold' | 'revenue' | 'stock'>(
    'unitsSold',
  )

  const sorted = [...PRODUCTS].sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Products"
        subtitle="Product performance — units sold, revenue, stock levels, and status breakdown."
        right={<DateRangeSelector value={range} onChange={setRange} />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((card, i) => (
          <StatCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Revenue Trend + Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Revenue by Product"
          subtitle="SUM(OrderItem.price × quantity) per product per month"
          action={
            <Legend
              items={PRODUCT_LINES.map((p) => ({
                label: p.key,
                color: p.color,
              }))}
            />
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={REVENUE_TREND}>
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
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              {PRODUCT_LINES.map((p) => (
                <Line
                  key={p.key}
                  type="monotone"
                  dataKey={p.key}
                  name={p.key}
                  stroke={p.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <div className="space-y-4">
          {/* Status breakdown pie */}
          <SectionCard
            title="Status Breakdown"
            subtitle="Product.status distribution"
          >
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie
                  data={STATUS_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {STATUS_BREAKDOWN.map((s) => (
                    <Cell key={s.status} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-2">
              {STATUS_BREAKDOWN.map((s) => (
                <div key={s.status} className="text-center">
                  <p className="text-lg font-bold text-gray-800">{s.count}</p>
                  <p className="text-[10px] font-semibold uppercase text-gray-400">
                    {s.status}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Stock level distribution */}
          <SectionCard
            title="Stock Distribution"
            subtitle="Product.quantity ranges"
          >
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={STOCK_LEVELS} barSize={20}>
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                {STOCK_LEVELS.map((_, i) => null)}
                <Bar dataKey="count" name="Products" radius={[4, 4, 0, 0]}>
                  {STOCK_LEVELS.map((_, i) => (
                    <Cell key={i} fill={STOCK_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="rounded-2xl shadow-sm border bg-background overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-sm font-semibold">Product Performance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Joined from Product ← OrderItem — price, stock, and sales data
            </p>
          </div>
          {/* Sort controls */}
          <div className="flex items-center gap-1 rounded-xl border bg-muted p-1">
            {(['unitsSold', 'revenue', 'stock'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                  ${
                    sortBy === s
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
              >
                {s === 'unitsSold'
                  ? 'Units Sold'
                  : s === 'revenue'
                    ? 'Revenue'
                    : 'Stock'}
              </button>
            ))}
          </div>
        </div>
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-muted border-b">
              {[
                'Product',
                'Status',
                'Price',
                'Stock',
                'Units Sold',
                'Revenue',
                'Featured',
              ].map((h) => (
                <TableHead
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-muted">
            {sorted.map((p) => (
              <TableRow
                key={p.id}
                className="hover:bg-muted/60 transition-colors group"
              >
                <TableCell className="px-6 py-3 font-medium">
                  {p.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  <Badge label={p.status} />
                </TableCell>
                <TableCell className="px-6 py-3">${p.price}</TableCell>
                <TableCell className="px-6 py-3">
                  <span
                    className={`font-semibold ${p.stock === 0 ? 'text-destructive' : p.stock <= 10 ? 'text-warning-foreground' : ''}`}
                  >
                    {p.stock}
                    {p.stock === 0 && (
                      <span className="ml-1 text-[10px]">⚠️</span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{
                          width: `${Math.min((p.unitsSold / 284) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-medium">{p.unitsSold}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3 font-semibold">
                  ${p.revenue.toLocaleString()}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {p.featured ? (
                    <span className="inline-flex items-center gap-1 text-xs text-warning-foreground font-semibold">
                      ⭐ Yes
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
