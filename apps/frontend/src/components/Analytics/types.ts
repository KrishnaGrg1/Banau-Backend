// ============================================
// ANALYTICS TYPES
// Mirrors your Prisma schema enums & models
// ============================================

// ── Enums (mirror Prisma) ────────────────────────────────────────────────────

// ── Stat Cards ───────────────────────────────────────────────────────────────

export interface StatCardData {
  label: string
  value: string
  delta: string
  /** true = positive trend (green), false = negative (red) */
  positive: boolean
  sub: string
  accent: string
  icon: string
}

// ── Revenue & Orders Chart ───────────────────────────────────────────────────

export interface RevenueDataPoint {
  month: string
  /** Aggregated Order.total for the month */
  revenue: number
  /** Count of orders for the month */
  orders: number
}

// ── Order Status Distribution ────────────────────────────────────────────────

export interface OrderStatusDataPoint {
  name: OrderStatus
  value: number
  color: string
}

// ── Customer Growth ──────────────────────────────────────────────────────────

export interface CustomerGrowthDataPoint {
  month: string
  /** Customers with no linked userId (guest) or first-time */
  new: number
  /** Customers with userId linked (returning) */
  returning: number
}

// ── Top Products ─────────────────────────────────────────────────────────────

export interface TopProduct {
  /** Product.name */
  name: string
  /** Sum of OrderItem.quantity for this product */
  sold: number
  /** Sum of OrderItem.price * quantity */
  revenue: number
  /** Product.status */
  status: ProductStatus
}

// ── Recent Orders ────────────────────────────────────────────────────────────

export interface RecentOrder {
  /** Order.id */
  id: string
  /** Customer.firstName + Customer.lastName */
  customer: string
  /** Order.total */
  total: number
  /** Order.status */
  status: OrderStatus
  /** Human-readable relative time */
  date: string
}

// ── Inventory Alert ──────────────────────────────────────────────────────────

export interface LowStockItem {
  /** Product.name */
  name: string
  /** Product.quantity */
  qty: number
}

// ── Tooltip (Recharts) ───────────────────────────────────────────────────────

export interface ChartTooltipPayloadItem {
  name: string
  value: number
  color: string
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string
}

// ============================================
// ANALYTICS TYPES — Full Suite
// Mirrors Prisma schema enums & models
// ============================================

// ── Prisma Enums ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export type Plan = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'

export type TenantStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'

export type DateRange = '7D' | '30D' | '90D' | '1Y'

// ── Shared ───────────────────────────────────────────────────────────────────

export interface StatCardData {
  label: string
  value: string
  delta: string
  /** true = green up, false = red down */
  positive: boolean
  sub: string
  accent: string
  icon: string
}

export interface ChartTooltipPayloadItem {
  name: string
  value: number
  color: string
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string
}

// ── Overview Page ─────────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  month: string
  /** Aggregated Order.total */
  revenue: number
  /** Count of Order rows */
  orders: number
}

export interface OrderStatusDataPoint {
  name: OrderStatus
  value: number
  color: string
}

export interface CustomerGrowthDataPoint {
  month: string
  /** Customer rows where userId is null or newly created */
  new: number
  /** Customer rows with userId linked */
  returning: number
}

export interface TopProduct {
  /** Product.name */
  name: string
  /** SUM(OrderItem.quantity) */
  sold: number
  /** SUM(OrderItem.price * quantity) */
  revenue: number
  status: ProductStatus
}

export interface RecentOrder {
  /** Order.id */
  id: string
  /** Customer.firstName + lastName */
  customer: string
  /** Order.total */
  total: number
  status: OrderStatus
  /** Relative human time e.g. "2 min ago" */
  date: string
}

export interface LowStockItem {
  /** Product.name */
  name: string
  /** Product.quantity */
  qty: number
}

// ── Sales Page ────────────────────────────────────────────────────────────────

export interface SalesDataPoint {
  date: string
  /** SUM(Order.total) for the day/week */
  revenue: number
  /** COUNT(Order) */
  orders: number
  /** AVG(Order.total) */
  avgOrderValue: number
}

export interface SalesByStatusDataPoint {
  status: OrderStatus
  count: number
  revenue: number
  color: string
}

export interface RefundDataPoint {
  month: string
  /** Count of REFUNDED orders */
  refunds: number
  /** Refund rate as % of total orders */
  rate: number
}

export interface SalesSummary {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  refundRate: number
  revenueGrowth: number // % vs previous period
  ordersGrowth: number
}

// ── Customers Page ────────────────────────────────────────────────────────────

export interface CustomerSegment {
  label: string
  /** Customer count in this segment */
  count: number
  /** SUM(Customer.totalSpent) */
  revenue: number
  color: string
}

export interface CustomerRetentionDataPoint {
  cohort: string // e.g. "Jan 2025"
  retained: number // % still active after N months
  churned: number
}

export interface TopCustomer {
  /** Customer.id */
  id: string
  /** firstName + lastName */
  name: string
  email: string
  /** Customer.ordersCount */
  orders: number
  /** Customer.totalSpent */
  totalSpent: number
  /** last Order.createdAt */
  lastOrder: string
}

export interface CustomerLocationDataPoint {
  country: string
  customers: number
  revenue: number
}

export interface CustomerSummary {
  totalCustomers: number
  newThisPeriod: number
  returningRate: number
  avgLifetimeValue: number
  customersGrowth: number
  avgOrdersPerCustomer: number
}

// ── Products Page ─────────────────────────────────────────────────────────────

export interface ProductPerformanceRow {
  /** Product.id */
  id: string
  /** Product.name */
  name: string
  status: ProductStatus
  /** Product.quantity */
  stock: number
  /** SUM(OrderItem.quantity) */
  unitsSold: number
  /** Product.price */
  price: number
  /** SUM(OrderItem.price * quantity) */
  revenue: number
  /** Product.featured */
  featured: boolean
}

export interface ProductStatusBreakdown {
  status: ProductStatus
  count: number
  color: string
}

export interface StockLevelDataPoint {
  range: string // e.g. "0–10", "11–50", "51–100", "100+"
  count: number
}

export interface ProductRevenueTrend {
  month: string
  /** Top product revenue each month */
  [productName: string]: number | string
}

export interface ProductSummary {
  totalProducts: number
  activeProducts: number
  draftProducts: number
  archivedProducts: number
  outOfStock: number
  lowStock: number
}

// ── Traffic Page ──────────────────────────────────────────────────────────────

export interface TrafficDataPoint {
  date: string
  /** Page views on tenant storefront */
  pageViews: number
  /** Unique sessions */
  sessions: number
  /** Orders created / sessions */
  conversionRate: number
}

export interface TrafficSourceDataPoint {
  source: string // "Direct", "Social", "Search", "Email", "Referral"
  sessions: number
  conversionRate: number
  revenue: number
  color: string
}

export interface TopPageDataPoint {
  path: string // e.g. "/shop", "/shop/wireless-earbuds"
  views: number
  bounceRate: number
  avgTimeOnPage: string
}

export interface DeviceBreakdownDataPoint {
  device: 'Desktop' | 'Mobile' | 'Tablet'
  sessions: number
  color: string
}

export interface TrafficSummary {
  totalPageViews: number
  totalSessions: number
  conversionRate: number
  bounceRate: number
  avgSessionDuration: string
  pageViewsGrowth: number
}
