import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useDeleteStaff,
  useExportAllStaffs,
  useListAllStaff,
} from '@/hooks/use-staff-management'
import { SearchTypes, StaffDto } from '@repo/shared'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LucideShoppingBag,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
export const Route = createFileRoute('/dashboard/staff/')({
  validateSearch: (search: Record<string, unknown>): SearchTypes => ({
    limit: Number(search?.limit) || 10,
    offset: Number(search?.offset) || 0,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()

  const limit = search.limit || 10
  const offset = search.offset || 0
  const { data, isLoading, error } = useListAllStaff({ limit, offset })

  console.log('data of staf', data)
  const { mutateAsync: deleteStaff, isPending: deletePending } =
    useDeleteStaff()
  const { mutateAsync: exportStaff } = useExportAllStaffs()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const StaffMember: StaffDto[] = data?.data.data ?? []
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

  const handleExport = async (format: 'csv' | 'xlsx') => {
    await exportStaff(format)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    await deleteStaff({ data: { staffId: deleteTargetId } })
    setDeleteTargetId(null)
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
          <h1 className="text-3xl font-bold tracking-tight">Staffs</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your staff members
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

      {meta && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Staff Members
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

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Staffs</CardTitle>

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
          ) : StaffMember.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <LucideShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No staffs yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Staff Member will appear here when staffMeber are created
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {StaffMember.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="font-medium">
                          {staff.user?.firstName} {staff.user?.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          #{staff.id.slice(-8).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{staff.user?.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {staff.canManageProducts && <div>• Products</div>}
                          {staff.canManageOrders && <div>• Orders</div>}
                          {staff.canManageCustomers && <div>• Customers</div>}
                          {staff.canManageStaff && <div>• Staff</div>}
                          {staff.canViewAnalytics && <div>• Analytics</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(staff.createdAt), 'PPP')}
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
                                to="/dashboard/staff/$id"
                                params={{ id: staff.id }}
                              >
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to="/dashboard/staff/$id/edit"
                                params={{ id: staff.id }}
                              >
                                Edit Staff
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTargetId(staff.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
            >
              {deletePending && <Spinner className="h-4 w-4" />}
              {deletePending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
