import type { RecentOrder, OrderStatus } from './types'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

interface RecentOrdersTableProps {
  data: RecentOrder[]
  onViewAll?: () => void
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  COMPLETED: 'bg-accent text-accent-foreground',
  PAID: 'bg-secondary text-secondary-foreground',
  SHIPPED: 'bg-muted text-foreground',
  PENDING: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-destructive/10 text-destructive',
  REFUNDED: 'bg-muted text-muted-foreground',
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function RecentOrdersTable({ data, onViewAll }: RecentOrdersTableProps) {
  return (
    <div className="rounded-2xl shadow-sm border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-base font-semibold">Recent Orders</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest activity across your store
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-muted-foreground hover:underline transition-colors"
          >
            View all orders →
          </button>
        )}
      </div>

      {/* Table */}
      <Table className="w-full text-sm">
        <TableHeader>
          <TableRow className="bg-muted border-b">
            {['Order ID', 'Customer', 'Total', 'Status', 'Time'].map((h) => (
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
          {data.map((order) => (
            <TableRow
              key={order.id}
              className="hover:bg-muted/60 transition-colors group"
            >
              {/* Order ID */}
              <TableCell className="px-6 py-4">
                <span className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {order.id}
                </span>
              </TableCell>

              {/* Customer */}
              <TableCell className="px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {getInitials(order.customer)}
                  </div>
                  <span className="font-medium">{order.customer}</span>
                </div>
              </TableCell>

              {/* Total */}
              <TableCell className="px-6 py-4 font-semibold">
                ${order.total.toFixed(2)}
              </TableCell>

              {/* Status badge */}
              <TableCell className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </TableCell>

              {/* Time */}
              <TableCell className="px-6 py-4 text-xs text-muted-foreground">
                {order.date}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
