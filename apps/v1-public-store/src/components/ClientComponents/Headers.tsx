import { useState } from 'react'
import {
  Menu,
  X,
  ShoppingBag,
  ArrowRight,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCartCount } from '@/lib/stores/cart.store'
import { useMyProfile, useCustomerLogout } from '#/hooks/use-customer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  tenant: {
    name: string
    subdomain: string
  }
  logo?: {
    url: string
  }
}

export default function Header({ tenant, logo }: HeaderProps) {
  const subdomain = tenant.subdomain
  const NAV_LINKS = [
    { label: 'Home', href: `/` },
    { label: 'Products', href: `/` },
    { label: 'About', href: `/` },
  ]
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const cartCount = useCartCount()
  const { data: profileRes } = useMyProfile()
  const { mutate: logout, isPending: loggingOut } = useCustomerLogout()

  const profile = profileRes?.data
  const isLoggedIn = !!profile

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => navigate({ to: `/s/${subdomain}` }),
    })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            params={{ subdomain }}
            className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
          >
            {logo?.url ? (
              <img
                src={logo.url}
                alt={tenant.name}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xs font-bold text-primary-foreground">
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  {tenant.name}
                </span>
              </>
            )}
          </Link>

          {/* Desktop Nav — centred absolutely */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Cart"
              onClick={() => navigate({ to: `/s/${subdomain}/cart` })}
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Button>

            {/* Auth section — desktop */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:inline-flex items-center gap-1.5"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">
                        {profile.firstName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="max-w-25 truncate text-sm">
                      {profile.firstName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-medium text-sm">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    {/* <Link to="//account/" params={{ subdomain }}>
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </Link> */}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {loggingOut ? 'Signing out…' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex cursor-pointer"
                  onClick={() =>
                    navigate({ to: `/s/${subdomain}/account/login` })
                  }
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg hidden md:inline-flex cursor-pointer"
                  onClick={() =>
                    navigate({ to: `/s/${subdomain}/account/register` })
                  }
                >
                  Get Started
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="border-t border-border mt-2 pt-2">
              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile.email}
                    </p>
                  </div>
                  {/* <Link
                    to="//account/"
                    params={{ subdomain }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4" /> My Account
                  </Link> */}
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      handleLogout()
                    }}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? 'Signing out…' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
                  {/* <Link
                    to="//account/login"
                    params={{ subdomain }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="//account/register"
                    params={{ subdomain }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link> */}
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
