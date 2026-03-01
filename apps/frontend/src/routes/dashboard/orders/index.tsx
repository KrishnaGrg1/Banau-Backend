// Order List Page
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import {
  useOrders,
  useUpdateOrderStatus,
  useExportOrders,
} from '@/hooks/use-order'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Download, ShoppingBag } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import type { OrderDto, OrderStatus } from '@repo/shared'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

// Define search params for pagination
interface OrdersSearch {
  limit?: number
  offset?: number
}

export const Route = createFileRoute('/dashboard/orders/')({
  validateSearch: (search: Record<string, unknown>): OrdersSearch => ({
    limit: Number(search?.limit) || 10,
    offset: Number(search?.offset) || 0,
  }),
  component: OrdersPage,
})

const statusColors: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'secondary',
  PAID: 'default',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
  FAILED: 'destructive',
}

const statusOptions: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
]

export default function OrdersPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()

  const limit = search.limit || 10
  const offset = search.offset || 0

  const { data, isLoading, error } = useOrders({ limit, offset })
  const updateOrderStatus = useUpdateOrderStatus()
  const exportOrders = useExportOrders()

  const orders: OrderDto[] = data?.data?.orders ?? []
  const meta = data?.data?.meta

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  const handleNextPage = () => {
    if (meta?.hasNextPage) {
      navigate({
        search: {
          limit,
          offset: offset + limit,
        },
      })
    }
  }

  const handlePrevPage = () => {
    if (meta?.hasPreviousPage) {
      navigate({
        search: {
          limit,
          offset: Math.max(0, offset - limit),
        },
      })
    }
  }

  const handleLimitChange = (newLimit: number) => {
    navigate({
      search: {
        limit: newLimit,
        offset: 0,
      },
    })
  }

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: { status } })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    await exportOrders.mutateAsync({ format })
  }

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track customer orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      {meta && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meta.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Page
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentPage} / {totalPages}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Showing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {offset + 1}-{Math.min(offset + limit, meta.total)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Orders</CardTitle>

            {/* Per Page Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => handleLimitChange(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No orders yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Orders will appear here when customers make purchases
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          to="/dashboard/orders/$id"
                          params={{ id: order.id }}
                          className="font-medium hover:underline"
                        >
                          #{order.id.slice(-8).toUpperCase()}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {order.items?.length ?? 0} item(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {order.ShippingfirstName} {order.ShippinglastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.ShippingEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(order.createdAt), 'PPP')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), 'p')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value: OrderStatus) =>
                            handleStatusChange(order.id, value)
                          }
                          disabled={updateOrderStatus.isPending}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <Badge variant={statusColors[order.status]}>
                              {order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(order.total)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link
                                to="/dashboard/orders/$id"
                                params={{ id: order.id }}
                              >
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to="/dashboard/orders/$id/edit"
                                params={{ id: order.id }}
                              >
                                Edit Order
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.total > limit && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {offset + 1} to{' '}
                    {Math.min(offset + limit, meta.total)} of {meta.total}{' '}
                    results
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={!meta.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!meta.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
