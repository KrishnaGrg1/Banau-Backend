import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { useMyProfile } from '@/hooks/use-customer-auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  Lock,
  ChevronRight,
} from 'lucide-react'

export const Route = createFileRoute('/s/$subdomain/account')({
  component: AccountLayout,
})

const NAV_ITEMS = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    to: '/s/$subdomain/account/' as const,
  },
  {
    label: 'My Orders',
    icon: ShoppingBag,
    to: '/s/$subdomain/account/orders/' as const,
  },
  {
    label: 'Profile',
    icon: User,
    to: '/s/$subdomain/account/profile' as const,
  },
  {
    label: 'Addresses',
    icon: MapPin,
    to: '/s/$subdomain/account/addresses/' as const,
  },
]

function AccountLayout() {
  const { subdomain } = Route.useParams()
  const { data: res, isLoading } = useMyProfile()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const profile = res?.data

  /* ── loading ─────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    )
  }

  /* ── auth gate ───────────────────────────────────────────────── */
  if (!profile) {
    // Allow the login and register routes to render even when unauthenticated
    // so users can reach the sign-in pages which are children of this layout.
    if (
      pathname.includes(`/s/${subdomain}/account/login`) ||
      pathname.includes(`/s/${subdomain}/account/register`)
    ) {
      return <Outlet />
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Sign in to your account</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          Access your orders, profile and saved addresses by signing in.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link to="/s/$subdomain/account/login" params={{ subdomain }}>
              Sign In
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/s/$subdomain/account/register" params={{ subdomain }}>
              Create Account
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  /* helper: is nav item active */
  const isActive = (to: string) => {
    const resolved = to.replace('$subdomain', subdomain)
    if (resolved.endsWith('/'))
      return pathname === resolved || pathname === resolved.slice(0, -1)
    return pathname === resolved || pathname.startsWith(resolved + '/')
  }

  const initials =
    (profile.firstName?.charAt(0) ?? '') + (profile.lastName?.charAt(0) ?? '')

  /* ── layout ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex gap-7">
          {/* ── Sidebar (desktop) ──────────────────────────────── */}
          <aside className="hidden md:flex flex-col gap-2 w-60 shrink-0">
            {/* Profile card */}
            <div className="rounded-2xl border bg-card p-5 flex flex-col items-center text-center gap-3 mb-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary uppercase">
                  {initials}
                </span>
              </div>
              <div className="min-w-0 w-full">
                <p className="font-semibold truncate">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="rounded-2xl border bg-card overflow-hidden">
              {NAV_ITEMS.map(({ label, icon: Icon, to }, i) => {
                const active = isActive(to)
                return (
                  <div key={label}>
                    {i > 0 && <Separator />}
                    <Link
                      to={to}
                      params={{ subdomain }}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors group ${
                        active
                          ? 'bg-primary/8 text-primary'
                          : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                      />
                      <span className="flex-1">{label}</span>
                      {active && (
                        <ChevronRight className="h-3.5 w-3.5 text-primary/60" />
                      )}
                    </Link>
                  </div>
                )
              })}
            </nav>
          </aside>

          {/* ── Main content ───────────────────────────────────── */}
          <main className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Mobile tab bar */}
            <div className="md:hidden flex gap-1 rounded-2xl border bg-card p-1.5 overflow-x-auto">
              {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
                const active = isActive(to)
                return (
                  <Link
                    key={label}
                    to={to}
                    params={{ subdomain }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                )
              })}
            </div>

            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
