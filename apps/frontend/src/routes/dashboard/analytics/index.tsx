import {
  CustomerGrowthChart,
  DateRange,
  DateRangeSelector,
  InventoryAlerts,
  OrderStatusChart,
  RecentOrdersTable,
  RevenueChart,
  StatCard,
  TopProductsTable,
} from '@/components/dashboard/Analytics'
import {
  CUSTOMER_GROWTH_DATA,
  LOW_STOCK_ITEMS,
  ORDER_STATUS_DATA,
  RECENT_ORDERS,
  REVENUE_DATA,
  STAT_CARDS,
  TOP_PRODUCTS,
} from '@/components/dashboard/Analytics/mockup'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
export const Route = createFileRoute('/dashboard/analytics/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [range, setRange] = useState<DateRange>('30D')
  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="min-h-screen "
    >
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');`}</style>

      <div className="mx-auto max-w-7xl px-6 py-10 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Dashboard
            </p>
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                letterSpacing: '-0.02em',
              }}
              className="text-4xl font-normal text-gray-900"
            >
              Store Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your store's performance — orders, revenue, and
              customer growth.
            </p>
          </div>
          <DateRangeSelector value={range} onChange={setRange} />
        </div>

        {/* ── KPI Stat Cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {STAT_CARDS.map((card, i) => (
            <StatCard key={card.label} card={card} index={i} />
          ))}
        </div>

        {/* ── Revenue Chart + Order Status ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={REVENUE_DATA} />
          </div>
          <OrderStatusChart data={ORDER_STATUS_DATA} />
        </div>

        {/* ── Customer Growth + Top Products ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <CustomerGrowthChart data={CUSTOMER_GROWTH_DATA} />
          </div>
          <div className="lg:col-span-3">
            <TopProductsTable
              data={TOP_PRODUCTS}
              onViewAll={() => console.log('navigate to /dashboard/products')}
            />
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <RecentOrdersTable
          data={RECENT_ORDERS}
          onViewAll={() => console.log('navigate to /dashboard/orders')}
        />

        {/* ── Inventory Alerts ── */}
        <InventoryAlerts
          items={LOW_STOCK_ITEMS}
          threshold={10}
          onManage={() =>
            console.log('navigate to /dashboard/inventory/low-stock')
          }
        />
      </div>
    </div>
  )
}
