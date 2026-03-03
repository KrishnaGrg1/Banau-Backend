import { useNavigate } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Plus,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'
import type { CustomerDto } from '@repo/shared'
import { avatarColor, formatCurrency, formatDate, getInitials } from './_utils'
import { CustomerActionsMenu } from './CustomerActionsMenu'

interface PaginationMeta {
  total: number
  limit: number
  offset: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface CustomersTableProps {
  customers: CustomerDto[]
  meta: PaginationMeta | undefined
  isLoading: boolean
  limit: number
  offset: number
  onLimitChange: (newLimit: number) => void
  onNextPage: () => void
  onPrevPage: () => void
}

export function CustomersTable({
  customers,
  meta,
  isLoading,
  limit,
  offset,
  onLimitChange,
  onNextPage,
  onPrevPage,
}: CustomersTableProps) {
  const navigate = useNavigate()
  const currentPage = meta ? Math.floor(offset / limit) + 1 : 1
  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            All Customers
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={limit.toString()}
              onValueChange={(v) => onLimitChange(Number(v))}
            >
              <SelectTrigger className="w-[72px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            onAdd={() => navigate({ to: '/dashboard/customers/new' })}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onRowClick={() =>
                      navigate({ to: `/dashboard/customers/${customer.id}` })
                    }
                  />
                ))}
              </TableBody>
            </Table>

            {meta && meta.total > limit && (
              <TablePagination
                meta={meta}
                limit={limit}
                offset={offset}
                currentPage={currentPage}
                totalPages={totalPages}
                onNext={onNextPage}
                onPrev={onPrevPage}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CustomerRow({
  customer,
  onRowClick,
}: {
  customer: CustomerDto
  onRowClick: () => void
}) {
  return (
    <TableRow className="cursor-pointer" onClick={onRowClick}>
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(customer.id)}`}
          >
            {getInitials(customer.firstName, customer.lastName)}
          </div>
          <div>
            <div className="font-medium text-sm leading-tight">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {customer.id.slice(0, 8)}…
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[180px]">{customer.email}</span>
          </span>
          {customer.phone && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              {customer.phone}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="text-right">
        <Badge variant="secondary" className="font-mono tabular-nums">
          {customer._count?.orders ?? customer.ordersCount}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <span className="font-semibold text-sm tabular-nums">
          {formatCurrency(customer.totalSpent)}
        </span>
      </TableCell>

      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(customer.lastOrderAt)}
        </span>
      </TableCell>

      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDate(customer.createdAt)}
        </span>
      </TableCell>

      <TableCell
        className="text-right pr-6"
        onClick={(e) => e.stopPropagation()}
      >
        <CustomerActionsMenu id={customer.id} />
      </TableCell>
    </TableRow>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Users className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">No customers yet</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs">
        Your customer list is empty. Add your first customer to get started.
      </p>
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add Customer
      </Button>
    </div>
  )
}

function TablePagination({
  meta,
  limit,
  offset,
  currentPage,
  totalPages,
  onNext,
  onPrev,
}: {
  meta: PaginationMeta
  limit: number
  offset: number
  currentPage: number
  totalPages: number
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div className="flex items-center justify-between px-6 pt-4 mt-2 border-t">
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {offset + 1}–{Math.min(offset + limit, meta.total)}
        </span>{' '}
        of <span className="font-medium text-foreground">{meta.total}</span>{' '}
        customers
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!meta.hasPreviousPage}
          className="h-8 px-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <span className="text-sm font-medium px-2 tabular-nums">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!meta.hasNextPage}
          className="h-8 px-3"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
