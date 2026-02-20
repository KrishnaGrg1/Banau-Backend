import { createFileRoute } from '@tanstack/react-router'

// /dashboard/analytics/traffic.tsx  →  Traffic Analytics

import { useState } from 'react'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  AreaChart,
  Area,
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
import {
  StatCard,
  ChartTooltip,
  DateRangeSelector,
  SectionCard,
  PageHeader,
  Legend,
} from '@/components/Analytics/shared'

import {
  DEVICES,
  HOURLY_DATA,
  SOURCES,
  STATS,
  TOP_PAGES,
  TRAFFIC_DATA,
} from '@/components/Analytics/mockup'
import { DateRange } from '@/components/Analytics'
export const Route = createFileRoute('/dashboard/analytics/traffic')({
  component: RouteComponent,
})

function RouteComponent() {
  const [range, setRange] = useState<DateRange>('30D')
  const totalSessions = DEVICES.reduce((a, d) => a + d.sessions, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Traffic"
        subtitle="Storefront visits, session quality, conversion funnel, and traffic sources."
        right={<DateRangeSelector value={range} onChange={setRange} />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((card, i) => (
          <StatCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Page Views + Sessions area */}
      <SectionCard
        title="Pageviews & Sessions"
        subtitle="Daily traffic to your tenant storefront (/s/$subdomain)"
        action={
          <Legend
            items={[
              { label: 'Page Views', color: '#3b82f6' },
              { label: 'Sessions', color: '#8b5cf6' },
            ]}
          />
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={TRAFFIC_DATA}>
            <defs>
              <linearGradient id="pvG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="pageViews"
              name="pageViews"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#pvG)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              name="sessions"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#sG)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Conversion Rate + Device Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Conversion Rate Trend"
          subtitle="Orders ÷ sessions — orders from Order model"
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TRAFFIC_DATA}>
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
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0.5, 2.5]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="conversionRate"
                name="conversionRate"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Device Breakdown"
          subtitle="Session distribution by device type"
        >
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie
                data={DEVICES}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={3}
                dataKey="sessions"
              >
                {DEVICES.map((d) => (
                  <Cell key={d.device} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {DEVICES.map((d) => (
              <div
                key={d.device}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-gray-500">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: d.color }}
                  />
                  {d.device}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">
                    {((d.sessions / totalSessions) * 100).toFixed(0)}%
                  </span>
                  <span className="font-semibold text-gray-700">
                    {d.sessions.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Traffic Sources + Hourly heatmap */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard
          className="lg:col-span-3"
          title="Traffic Sources"
          subtitle="Where sessions originate — mapped to Order.total where converted"
        >
          <div className="space-y-3 mt-1">
            {SOURCES.map((src) => {
              const maxS = SOURCES[0].sessions
              return (
                <div key={src.source}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: src.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 w-16">
                        {src.source}
                      </span>
                      <span className="text-xs text-gray-400">
                        {src.sessions.toLocaleString()} sessions
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span
                        className={`font-medium ${src.conversionRate >= 1.5 ? 'text-emerald-600' : 'text-gray-500'}`}
                      >
                        {src.conversionRate}% CVR
                      </span>
                      <span className="font-semibold text-gray-800 w-14 text-right">
                        ${src.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(src.sessions / maxS) * 100}%`,
                        background: src.color,
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
          title="Sessions by Hour"
          subtitle="Traffic pattern across a typical day (UTC+5)"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={HOURLY_DATA} barSize={8}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 8, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v.split(':')[0] % 6 === 0 ? v : '')}
              />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="sessions"
                name="sessions"
                fill="#3b82f6"
                radius={[2, 2, 0, 0]}
                opacity={0.7}
              >
                {HOURLY_DATA.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.sessions > 800
                        ? '#111827'
                        : entry.sessions > 500
                          ? '#3b82f6'
                          : '#bfdbfe'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-gray-900 inline-block" />{' '}
              Peak
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-blue-400 inline-block" />{' '}
              Active
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-blue-200 inline-block" />{' '}
              Low
            </span>
          </div>
        </SectionCard>
      </div>

      {/* Top Pages */}
      <div className="rounded-2xl shadow-sm border bg-background overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-sm font-semibold">Top Pages</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Most visited paths on your storefront — /s/$subdomain/…
          </p>
        </div>
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-muted border-b">
              {['Page Path', 'Views', 'Bounce Rate', 'Avg. Time on Page'].map(
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
            {TOP_PAGES.map((page) => {
              const maxViews = TOP_PAGES[0].views
              return (
                <TableRow
                  key={page.path}
                  className="hover:bg-muted/60 transition-colors group"
                >
                  <TableCell className="px-6 py-3">
                    <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {page.path}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${(page.views / maxViews) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <span
                      className={`text-sm font-semibold ${page.bounceRate > 50 ? 'text-destructive' : page.bounceRate > 30 ? 'text-warning-foreground' : 'text-success-foreground'}`}
                    >
                      {page.bounceRate}%
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm text-muted-foreground">
                    {page.avgTimeOnPage}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
