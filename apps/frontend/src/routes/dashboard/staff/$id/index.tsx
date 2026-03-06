import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useStaffById } from '@/hooks/use-staff-management'
import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ArrowLeft, CheckCircle2, Pencil, XCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/staff/$id/')({
  component: RouteComponent,
})

const PERMISSIONS = [
  { key: 'canManageProducts', label: 'Manage Products' },
  { key: 'canManageOrders', label: 'Manage Orders' },
  { key: 'canManageCustomers', label: 'Manage Customers' },
  { key: 'canViewAnalytics', label: 'View Analytics' },
  { key: 'canManageStaff', label: 'Manage Staff' },
] as const

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

function RouteComponent() {
  const { id } = Route.useParams()
  const { data, isLoading, error } = useStaffById(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <p className="text-sm text-muted-foreground px-6 pb-4">
              {error?.message ?? 'Staff member not found.'}
            </p>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const fullName =
    `${data.user?.firstName ?? ''} ${data.user?.lastName ?? ''}`.trim()
  const initials =
    [data.user?.firstName?.[0], data.user?.lastName?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || '?'

  return (
    <div className=" space-y-5">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Member</h1>
          <p className="text-muted-foreground mt-1">
            View and manage staff details
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/dashboard/staff/$id/edit" params={{ id }}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit Permission
          </Link>
        </Button>
      </div>

      {/* Profile banner */}
      <Card>
        <CardContent className="pt-6 pb-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight truncate">
                {fullName || '—'}
              </h1>
              <p className="text-sm text-muted-foreground capitalize mt-0.5">
                {data.user?.role?.toLowerCase().replace(/_/g, ' ') ?? 'Staff'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                #{data.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Badge
                variant="outline"
                className={
                  data.user?.isActive
                    ? 'text-green-700 border-green-300 bg-green-50'
                    : 'text-red-600 border-red-200 bg-red-50'
                }
              >
                {data.user?.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {data.user?.isVerified && (
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-200 bg-blue-50"
                >
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Account details */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <InfoRow label="Email" value={data.user?.email ?? '—'} />
            <Separator />
            <InfoRow
              label="Email verified"
              value={
                data.user?.isVerified ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> No
                  </span>
                )
              }
            />
            <Separator />
            <InfoRow
              label="Account status"
              value={
                data.user?.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )
              }
            />
            <Separator />
            <InfoRow
              label="Last login"
              value={
                data.user?.lastLoginAt
                  ? format(new Date(data.user.lastLoginAt), 'PPp')
                  : 'Never'
              }
            />
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <InfoRow
              label="Staff since"
              value={format(new Date(data.createdAt), 'PP')}
            />
            <Separator />
            <InfoRow
              label="Last updated"
              value={format(new Date(data.updatedAt), 'PP')}
            />
            {data.user?.createdAt && (
              <>
                <Separator />
                <InfoRow
                  label="Account created"
                  value={format(new Date(data.user.createdAt), 'PP')}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid gap-1">
            {PERMISSIONS.map(({ key, label }, i) => {
              const granted = !!data[key]
              return (
                <div key={key}>
                  {i !== 0 && <Separator />}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                    {granted ? (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Allowed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        Denied
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
