// ── Mock data (replace with your API / tRPC calls) ───────────────────────────

import {
  CustomerGrowthDataPoint,
  CustomerLocationDataPoint,
  CustomerRetentionDataPoint,
  CustomerSegment,
  DeviceBreakdownDataPoint,
  LowStockItem,
  OrderStatusDataPoint,
  ProductPerformanceRow,
  ProductRevenueTrend,
  ProductStatusBreakdown,
  RecentOrder,
  RefundDataPoint,
  RevenueDataPoint,
  SalesByStatusDataPoint,
  SalesDataPoint,
  StatCardData,
  StockLevelDataPoint,
  TopCustomer,
  TopPageDataPoint,
  TopProduct,
  TrafficDataPoint,
  TrafficSourceDataPoint,
} from './types'

export const STAT_CARDS: StatCardData[] = [
  {
    label: 'Total Revenue',
    value: '$34,700',
    delta: '20.1%',
    positive: true,
    sub: 'vs last month',
    accent: '#10b981',
    icon: '💰',
  },
  {
    label: 'Total Orders',
    value: '219',
    delta: '16.4%',
    positive: true,
    sub: 'vs last month',
    accent: '#3b82f6',
    icon: '📦',
  },
  {
    label: 'Customers',
    value: '1,284',
    delta: '8.7%',
    positive: true,
    sub: 'total registered',
    accent: '#8b5cf6',
    icon: '👥',
  },
  {
    label: 'Avg. Order Value',
    value: '$158.4',
    delta: '3.2%',
    positive: false,
    sub: 'vs last month',
    accent: '#f59e0b',
    icon: '🧾',
  },
  {
    label: 'Active Products',
    value: '142',
    delta: '5',
    positive: true,
    sub: 'listed this month',
    accent: '#ec4899',
    icon: '🛍',
  },
  {
    label: 'Refund Rate',
    value: '1.5%',
    delta: '0.3%',
    positive: true,
    sub: 'of total orders',
    accent: '#14b8a6',
    icon: '↩️',
  },
]

export const REVENUE_DATA: RevenueDataPoint[] = [
  { month: 'Aug', revenue: 12400, orders: 84 },
  { month: 'Sep', revenue: 18200, orders: 112 },
  { month: 'Oct', revenue: 15800, orders: 98 },
  { month: 'Nov', revenue: 24600, orders: 156 },
  { month: 'Dec', revenue: 31200, orders: 204 },
  { month: 'Jan', revenue: 28900, orders: 188 },
  { month: 'Feb', revenue: 34700, orders: 219 },
]

export const ORDER_STATUS_DATA: OrderStatusDataPoint[] = [
  { name: 'COMPLETED', value: 412, color: '#10b981' },
  { name: 'SHIPPED', value: 88, color: '#3b82f6' },
  { name: 'PAID', value: 54, color: '#8b5cf6' },
  { name: 'PENDING', value: 31, color: '#f59e0b' },
  { name: 'CANCELLED', value: 22, color: '#ef4444' },
  { name: 'REFUNDED', value: 9, color: '#6b7280' },
]

export const CUSTOMER_GROWTH_DATA: CustomerGrowthDataPoint[] = [
  { month: 'Aug', new: 24, returning: 61 },
  { month: 'Sep', new: 38, returning: 74 },
  { month: 'Oct', new: 31, returning: 67 },
  { month: 'Nov', new: 52, returning: 104 },
  { month: 'Dec', new: 67, returning: 137 },
  { month: 'Jan', new: 58, returning: 130 },
  { month: 'Feb', new: 74, returning: 145 },
]

export const TOP_PRODUCTS: TopProduct[] = [
  { name: 'Wireless Earbuds Pro', sold: 284, revenue: 28400, status: 'ACTIVE' },
  { name: 'Leather Wallet Slim', sold: 198, revenue: 9900, status: 'ACTIVE' },
  { name: 'Bamboo Desk Organizer', sold: 167, revenue: 8350, status: 'ACTIVE' },
  {
    name: 'Ceramic Pour-over Kit',
    sold: 143,
    revenue: 14300,
    status: 'ACTIVE',
  },
  {
    name: 'Merino Wool Socks 3pk',
    sold: 121,
    revenue: 3630,
    status: 'ARCHIVED',
  },
]

export const RECENT_ORDERS: RecentOrder[] = [
  {
    id: 'ORD-2891',
    customer: 'Ayesha Khan',
    total: 124.0,
    status: 'COMPLETED',
    date: '2 min ago',
  },
  {
    id: 'ORD-2890',
    customer: 'Marcus Rivera',
    total: 89.5,
    status: 'PAID',
    date: '18 min ago',
  },
  {
    id: 'ORD-2889',
    customer: 'Priya Patel',
    total: 210.0,
    status: 'SHIPPED',
    date: '1 hr ago',
  },
  {
    id: 'ORD-2888',
    customer: 'James Okonkwo',
    total: 45.0,
    status: 'PENDING',
    date: '3 hr ago',
  },
  {
    id: 'ORD-2887',
    customer: 'Sofia Lindqvist',
    total: 178.0,
    status: 'COMPLETED',
    date: '5 hr ago',
  },
]

export const LOW_STOCK_ITEMS: LowStockItem[] = [
  { name: 'Wireless Earbuds Pro', qty: 4 },
  { name: 'Ceramic Pour-over Kit', qty: 2 },
  { name: 'Leather Wallet Slim', qty: 7 },
]

export const SALES_DATA: SalesDataPoint[] = [
  { date: 'Feb 1', revenue: 980, orders: 6, avgOrderValue: 163 },
  { date: 'Feb 3', revenue: 1420, orders: 9, avgOrderValue: 158 },
  { date: 'Feb 5', revenue: 2100, orders: 13, avgOrderValue: 162 },
  { date: 'Feb 7', revenue: 1680, orders: 11, avgOrderValue: 153 },
  { date: 'Feb 9', revenue: 3200, orders: 20, avgOrderValue: 160 },
  { date: 'Feb 11', revenue: 2800, orders: 17, avgOrderValue: 165 },
  { date: 'Feb 13', revenue: 1900, orders: 12, avgOrderValue: 158 },
  { date: 'Feb 15', revenue: 4100, orders: 26, avgOrderValue: 158 },
  { date: 'Feb 17', revenue: 3600, orders: 23, avgOrderValue: 157 },
  { date: 'Feb 19', revenue: 4800, orders: 30, avgOrderValue: 160 },
  { date: 'Feb 21', revenue: 3900, orders: 24, avgOrderValue: 163 },
  { date: 'Feb 23', revenue: 5100, orders: 32, avgOrderValue: 159 },
  { date: 'Feb 25', revenue: 2700, orders: 17, avgOrderValue: 159 },
  { date: 'Feb 28', revenue: 1220, orders: 8, avgOrderValue: 153 },
]

export const STATUS_DATA: SalesByStatusDataPoint[] = [
  { status: 'COMPLETED', count: 412, revenue: 65420, color: '#10b981' },
  { status: 'SHIPPED', count: 88, revenue: 13930, color: '#3b82f6' },
  { status: 'PAID', count: 54, revenue: 8560, color: '#8b5cf6' },
  { status: 'PENDING', count: 31, revenue: 4910, color: '#f59e0b' },
  { status: 'CANCELLED', count: 22, revenue: 0, color: '#ef4444' },
  { status: 'REFUNDED', count: 9, revenue: -1420, color: '#6b7280' },
]

export const REFUND_DATA: RefundDataPoint[] = [
  { month: 'Aug', refunds: 3, rate: 0.8 },
  { month: 'Sep', refunds: 5, rate: 1.2 },
  { month: 'Oct', refunds: 4, rate: 1.0 },
  { month: 'Nov', refunds: 8, rate: 2.1 },
  { month: 'Dec', refunds: 6, rate: 1.4 },
  { month: 'Jan', refunds: 7, rate: 1.9 },
  { month: 'Feb', refunds: 3, rate: 1.5 },
]

export const GROWTH_DATA: CustomerGrowthDataPoint[] = [
  { month: 'Aug', new: 24, returning: 61 },
  { month: 'Sep', new: 38, returning: 74 },
  { month: 'Oct', new: 31, returning: 67 },
  { month: 'Nov', new: 52, returning: 104 },
  { month: 'Dec', new: 67, returning: 137 },
  { month: 'Jan', new: 58, returning: 130 },
  { month: 'Feb', new: 74, returning: 145 },
]

export const SEGMENTS: CustomerSegment[] = [
  { label: 'Champions', count: 142, revenue: 58420, color: '#10b981' },
  { label: 'Loyal', count: 284, revenue: 41200, color: '#3b82f6' },
  { label: 'At Risk', count: 198, revenue: 22400, color: '#f59e0b' },
  { label: 'Promising', count: 321, revenue: 18900, color: '#8b5cf6' },
  { label: 'Lost', count: 339, revenue: 4100, color: '#ef4444' },
]

export const RETENTION_DATA: CustomerRetentionDataPoint[] = [
  { cohort: 'Aug', retained: 100, churned: 0 },
  { cohort: 'Sep', retained: 84, churned: 16 },
  { cohort: 'Oct', retained: 72, churned: 28 },
  { cohort: 'Nov', retained: 65, churned: 35 },
  { cohort: 'Dec', retained: 58, churned: 42 },
  { cohort: 'Jan', retained: 52, churned: 48 },
  { cohort: 'Feb', retained: 48, churned: 52 },
]

export const TOP_CUSTOMERS: TopCustomer[] = [
  {
    id: 'cus_001',
    name: 'Ayesha Khan',
    email: 'ayesha@email.com',
    orders: 14,
    totalSpent: 2840,
    lastOrder: '2 days ago',
  },
  {
    id: 'cus_002',
    name: 'Marcus Rivera',
    email: 'marcus@email.com',
    orders: 11,
    totalSpent: 2210,
    lastOrder: '5 days ago',
  },
  {
    id: 'cus_003',
    name: 'Priya Patel',
    email: 'priya@email.com',
    orders: 9,
    totalSpent: 1980,
    lastOrder: '1 week ago',
  },
  {
    id: 'cus_004',
    name: 'James Okonkwo',
    email: 'james@email.com',
    orders: 8,
    totalSpent: 1720,
    lastOrder: '1 week ago',
  },
  {
    id: 'cus_005',
    name: 'Sofia Lindqvist',
    email: 'sofia@email.com',
    orders: 7,
    totalSpent: 1540,
    lastOrder: '2 weeks ago',
  },
]

export const LOCATIONS: CustomerLocationDataPoint[] = [
  { country: 'Pakistan', customers: 480, revenue: 76800 },
  { country: 'United Kingdom', customers: 210, revenue: 42100 },
  { country: 'United States', customers: 184, revenue: 36800 },
  { country: 'UAE', customers: 160, revenue: 32000 },
  { country: 'Canada', customers: 98, revenue: 19600 },
  { country: 'Germany', customers: 72, revenue: 14400 },
  { country: 'Other', customers: 80, revenue: 16000 },
]

export const BEHAVIOR_RADAR = [
  { metric: 'Repeat Purchase', value: 82 },
  { metric: 'Avg Cart Size', value: 68 },
  { metric: 'Review Rate', value: 44 },
  { metric: 'Email Open Rate', value: 57 },
  { metric: 'Referral Rate', value: 31 },
  { metric: 'Return Rate', value: 18 },
]

// ── Mock data ────────────────────────────────────────────────────────────────

export const STATS: StatCardData[] = [
  {
    label: 'Total Products',
    value: '198',
    delta: '12',
    positive: true,
    sub: 'all time',
    accent: '#ec4899',
    icon: '🛍',
  },
  {
    label: 'Active',
    value: '142',
    delta: '5',
    positive: true,
    sub: 'Product.status',
    accent: '#10b981',
    icon: '✅',
  },
  {
    label: 'Out of Stock',
    value: '11',
    delta: '3',
    positive: false,
    sub: 'qty = 0',
    accent: '#ef4444',
    icon: '📭',
  },
  {
    label: 'Low Stock',
    value: '24',
    delta: '2',
    positive: false,
    sub: 'qty ≤ 10',
    accent: '#f59e0b',
    icon: '⚠️',
  },
  {
    label: 'Units Sold',
    value: '4,821',
    delta: '18.3%',
    positive: true,
    sub: 'SUM(OrderItem.qty)',
    accent: '#3b82f6',
    icon: '📦',
  },
  {
    label: 'Product Revenue',
    value: '$65,400',
    delta: '22.1%',
    positive: true,
    sub: 'SUM(OrderItem.price×qty)',
    accent: '#8b5cf6',
    icon: '💰',
  },
  {
    label: 'Total Revenue',
    value: '$34,700',
    delta: '20.1%',
    positive: true,
    sub: 'vs last period',
    accent: '#10b981',
    icon: '💰',
  },
  {
    label: 'Total Orders',
    value: '219',
    delta: '16.4%',
    positive: true,
    sub: 'vs last period',
    accent: '#3b82f6',
    icon: '📦',
  },
  {
    label: 'Avg Order Value',
    value: '$158.4',
    delta: '3.2%',
    positive: false,
    sub: 'vs last period',
    accent: '#f59e0b',
    icon: '🧾',
  },
  {
    label: 'Refund Rate',
    value: '1.5%',
    delta: '0.3%',
    positive: true,
    sub: 'of total orders',
    accent: '#ef4444',
    icon: '↩️',
  },
  {
    label: 'Total Customers',
    value: '1,284',
    delta: '8.7%',
    positive: true,
    sub: 'vs last period',
    accent: '#8b5cf6',
    icon: '👥',
  },
  {
    label: 'New This Month',
    value: '74',
    delta: '27.6%',
    positive: true,
    sub: 'newly registered',
    accent: '#3b82f6',
    icon: '🆕',
  },
  {
    label: 'Returning Rate',
    value: '66.2%',
    delta: '2.1%',
    positive: true,
    sub: 'repurchased',
    accent: '#10b981',
    icon: '🔁',
  },
  {
    label: 'Avg LTV',
    value: '$289',
    delta: '5.4%',
    positive: true,
    sub: 'lifetime value',
    accent: '#f59e0b',
    icon: '💎',
  },
]

export const PRODUCTS: ProductPerformanceRow[] = [
  {
    id: 'p1',
    name: 'Wireless Earbuds Pro',
    status: 'ACTIVE',
    stock: 4,
    unitsSold: 284,
    price: 100,
    revenue: 28400,
    featured: true,
  },
  {
    id: 'p2',
    name: 'Leather Wallet Slim',
    status: 'ACTIVE',
    stock: 7,
    unitsSold: 198,
    price: 50,
    revenue: 9900,
    featured: false,
  },
  {
    id: 'p3',
    name: 'Bamboo Desk Organizer',
    status: 'ACTIVE',
    stock: 34,
    unitsSold: 167,
    price: 50,
    revenue: 8350,
    featured: false,
  },
  {
    id: 'p4',
    name: 'Ceramic Pour-over Kit',
    status: 'ACTIVE',
    stock: 2,
    unitsSold: 143,
    price: 100,
    revenue: 14300,
    featured: true,
  },
  {
    id: 'p5',
    name: 'Merino Wool Socks 3pk',
    status: 'ARCHIVED',
    stock: 0,
    unitsSold: 121,
    price: 30,
    revenue: 3630,
    featured: false,
  },
  {
    id: 'p6',
    name: 'Brushed Steel Thermos',
    status: 'ACTIVE',
    stock: 52,
    unitsSold: 98,
    price: 75,
    revenue: 7350,
    featured: false,
  },
  {
    id: 'p7',
    name: 'Linen Throw Pillow',
    status: 'DRAFT',
    stock: 20,
    unitsSold: 0,
    price: 45,
    revenue: 0,
    featured: false,
  },
]

export const STATUS_BREAKDOWN: ProductStatusBreakdown[] = [
  { status: 'ACTIVE', count: 142, color: '#10b981' },
  { status: 'DRAFT', count: 34, color: '#f59e0b' },
  { status: 'ARCHIVED', count: 22, color: '#9ca3af' },
]

export const STOCK_LEVELS: StockLevelDataPoint[] = [
  { range: 'Out (0)', count: 11 },
  { range: '1–10', count: 24 },
  { range: '11–50', count: 67 },
  { range: '51–100', count: 48 },
  { range: '100+', count: 48 },
]

export const REVENUE_TREND: ProductRevenueTrend[] = [
  {
    month: 'Aug',
    Earbuds: 8200,
    Wallet: 2800,
    Organizer: 2100,
    'Pour-over': 3900,
  },
  {
    month: 'Sep',
    Earbuds: 11400,
    Wallet: 3600,
    Organizer: 2800,
    'Pour-over': 5200,
  },
  {
    month: 'Oct',
    Earbuds: 9800,
    Wallet: 3100,
    Organizer: 2400,
    'Pour-over': 4400,
  },
  {
    month: 'Nov',
    Earbuds: 14200,
    Wallet: 4100,
    Organizer: 3200,
    'Pour-over': 6800,
  },
  {
    month: 'Dec',
    Earbuds: 18600,
    Wallet: 5200,
    Organizer: 4100,
    'Pour-over': 8900,
  },
  {
    month: 'Jan',
    Earbuds: 16400,
    Wallet: 4700,
    Organizer: 3700,
    'Pour-over': 7800,
  },
  {
    month: 'Feb',
    Earbuds: 19800,
    Wallet: 5500,
    Organizer: 4300,
    'Pour-over': 9600,
  },
]

export const PRODUCT_LINES = [
  { key: 'Earbuds', color: '#111827' },
  { key: 'Wallet', color: '#3b82f6' },
  { key: 'Organizer', color: '#10b981' },
  { key: 'Pour-over', color: '#8b5cf6' },
]

export const STOCK_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
]

export const TRAFFIC_DATA: TrafficDataPoint[] = [
  { date: 'Feb 1', pageViews: 1240, sessions: 480, conversionRate: 1.04 },
  { date: 'Feb 3', pageViews: 1820, sessions: 710, conversionRate: 1.27 },
  { date: 'Feb 5', pageViews: 2100, sessions: 820, conversionRate: 1.59 },
  { date: 'Feb 7', pageViews: 1680, sessions: 640, conversionRate: 1.72 },
  { date: 'Feb 9', pageViews: 3200, sessions: 1240, conversionRate: 1.61 },
  { date: 'Feb 11', pageViews: 2800, sessions: 1080, conversionRate: 1.57 },
  { date: 'Feb 13', pageViews: 1900, sessions: 730, conversionRate: 1.64 },
  { date: 'Feb 15', pageViews: 4100, sessions: 1580, conversionRate: 1.65 },
  { date: 'Feb 17', pageViews: 3600, sessions: 1400, conversionRate: 1.64 },
  { date: 'Feb 19', pageViews: 4800, sessions: 1860, conversionRate: 1.61 },
  { date: 'Feb 21', pageViews: 3900, sessions: 1520, conversionRate: 1.58 },
  { date: 'Feb 23', pageViews: 5100, sessions: 1970, conversionRate: 1.62 },
  { date: 'Feb 25', pageViews: 2700, sessions: 1060, conversionRate: 1.6 },
  { date: 'Feb 28', pageViews: 1220, sessions: 480, conversionRate: 1.67 },
]

export const SOURCES: TrafficSourceDataPoint[] = [
  {
    source: 'Direct',
    sessions: 6840,
    conversionRate: 1.82,
    revenue: 18200,
    color: '#111827',
  },
  {
    source: 'Social',
    sessions: 4920,
    conversionRate: 0.94,
    revenue: 9400,
    color: '#ec4899',
  },
  {
    source: 'Search',
    sessions: 3870,
    conversionRate: 1.61,
    revenue: 14300,
    color: '#3b82f6',
  },
  {
    source: 'Email',
    sessions: 1840,
    conversionRate: 2.34,
    revenue: 8800,
    color: '#10b981',
  },
  {
    source: 'Referral',
    sessions: 1170,
    conversionRate: 1.12,
    revenue: 3700,
    color: '#f59e0b',
  },
]

export const TOP_PAGES: TopPageDataPoint[] = [
  { path: '/', views: 14820, bounceRate: 38.2, avgTimeOnPage: '1m 12s' },
  { path: '/shop', views: 11240, bounceRate: 31.4, avgTimeOnPage: '2m 48s' },
  {
    path: '/shop/wireless-earbuds',
    views: 6480,
    bounceRate: 24.1,
    avgTimeOnPage: '3m 22s',
  },
  {
    path: '/shop/leather-wallet',
    views: 4210,
    bounceRate: 27.8,
    avgTimeOnPage: '2m 58s',
  },
  { path: '/cart', views: 3940, bounceRate: 18.6, avgTimeOnPage: '1m 44s' },
  { path: '/checkout', views: 2840, bounceRate: 12.3, avgTimeOnPage: '4m 11s' },
  { path: '/about', views: 1980, bounceRate: 56.7, avgTimeOnPage: '0m 48s' },
]

export const DEVICES: DeviceBreakdownDataPoint[] = [
  { device: 'Mobile', sessions: 10842, color: '#3b82f6' },
  { device: 'Desktop', sessions: 6524, color: '#111827' },
  { device: 'Tablet', sessions: 1274, color: '#9ca3af' },
]

export const HOURLY_DATA = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  sessions: Math.floor(Math.random() * 800 + (h >= 9 && h <= 22 ? 400 : 50)),
}))
