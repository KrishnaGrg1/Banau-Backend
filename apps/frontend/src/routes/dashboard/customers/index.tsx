import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Download, Loader, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import {
  useExportAllCustomers,
  useListAllCustomers,
} from '@/hooks/use-customer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CustomerDto, SearchTypes } from '@repo/shared'
import { StatCard } from '@/components/customer/StatCard'
import { CustomersTable } from '@/components/customer/CustomersTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/dashboard/customers/')({
  validateSearch: (search: Record<string, unknown>): SearchTypes => ({
    limit: Number(search?.limit) || 10,
    offset: Number(search?.offset) || 0,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { limit = 10, offset = 0 } = Route.useSearch()

  const { data, isLoading, error } = useListAllCustomers({ limit, offset })
  const { mutateAsync: exportCustomers, isPending: exportingCustomers } =
    useExportAllCustomers()
  const customers: CustomerDto[] = Array.isArray(data?.data?.customers)
    ? data.data.customers
    : []
  const meta = data?.data?.meta

  const currentPage = meta ? Math.floor(offset / limit) + 1 : 1
  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  const handleNextPage = () => {
    if (meta?.hasNextPage)
      navigate({ search: { limit, offset: offset + limit } })
  }
  const handlePrevPage = () => {
    if (meta?.hasPreviousPage)
      navigate({ search: { limit, offset: Math.max(0, offset - limit) } })
  }
  const handleLimitChange = (newLimit: number) => {
    navigate({ search: { limit: newLimit, offset: 0 } })
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    await exportCustomers(format)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Something went wrong</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View and manage your customer base
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={exportingCustomers}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleExport('csv')}
                disabled={exportingCustomers}
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('xlsx')}
                disabled={exportingCustomers}
              >
                Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      {meta && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Users}
            label="Total Customers"
            value={meta.total.toLocaleString()}
          />
          <StatCard
            icon={TrendingUp}
            label="Current Page"
            value={`${currentPage} / ${totalPages}`}
            sub={`${limit} per page`}
          />
          <StatCard
            icon={ShoppingBag}
            label="Showing"
            value={`${offset + 1}–${Math.min(offset + limit, meta.total)}`}
            sub={`of ${meta.total} customers`}
          />
        </div>
      )}

      {exportingCustomers && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-sm">
            <CardHeader className="flex flex-col items-center gap-4">
              <Loader className="h-8 w-8 animate-spin" />
              <CardTitle>Exporting Customers</CardTitle>
              <CardDescription>
                Please wait while we export your data...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
      {/* Table */}
      <CustomersTable
        customers={customers}
        meta={meta}
        isLoading={isLoading}
        limit={limit}
        offset={offset}
        onLimitChange={handleLimitChange}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
      />
    </div>
  )
}
