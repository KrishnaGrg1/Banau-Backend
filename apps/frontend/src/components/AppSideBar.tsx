import { useState } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useLogOut } from '@/hooks/user-auth'
import { useGetMe } from '@/hooks/use-user'
import { useGetTenant } from '@/hooks/use-tenant'
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Settings,
  Sparkles,
  Eye,
  ExternalLink,
  LogOut,
  ChevronUp,
  ChevronRight,
  User,
  Users,
  BarChart3,
  Tag,
  Boxes,
  UserCog,
  Plus,
  AlertTriangle,
  Sliders,
  TrendingUp,
  Activity,
  Globe,
  CreditCard,
  Truck,
  Receipt,
  Bell,
  Banknote,
  Palette,
  Lock,
  UserCircle,
} from 'lucide-react'

// ─── Nav config ──────────────────────────────────────────────────────────────

const navMain = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    to: '/dashboard',
    exact: true,
  },
  {
    title: 'Products',
    icon: ShoppingBag,
    to: '/dashboard/products',
    children: [
      { title: 'All Products', icon: ShoppingBag, to: '/dashboard/products' },
      { title: 'Add Product', icon: Plus, to: '/dashboard/products/new' },
    ],
  },
  {
    title: 'Orders',
    icon: ClipboardList,
    to: '/dashboard/orders',
    children: [
      { title: 'All Orders', icon: ClipboardList, to: '/dashboard/orders' },
    ],
  },
  {
    title: 'Customers',
    icon: Users,
    to: '/dashboard/customers',
    children: [
      { title: 'All Customers', icon: Users, to: '/dashboard/customers' },
    ],
  },
  {
    title: 'Categories',
    icon: Tag,
    to: '/dashboard/categories',
    children: [
      { title: 'All Categories', icon: Tag, to: '/dashboard/categories' },
      { title: 'New Category', icon: Plus, to: '/dashboard/categories/new' },
    ],
  },
  {
    title: 'Inventory',
    icon: Boxes,
    to: '/dashboard/inventory',
    children: [
      { title: 'Overview', icon: Boxes, to: '/dashboard/inventory' },
      {
        title: 'Low Stock',
        icon: AlertTriangle,
        to: '/dashboard/inventory/low-stock',
        badge: 'alert',
      },
      {
        title: 'Adjustments',
        icon: Sliders,
        to: '/dashboard/inventory/adjustments',
      },
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    to: '/dashboard/analytics',
    children: [
      { title: 'Overview', icon: BarChart3, to: '/dashboard/analytics' },
      { title: 'Sales', icon: TrendingUp, to: '/dashboard/analytics/sales' },
      { title: 'Customers', icon: Users, to: '/dashboard/analytics/customers' },
      {
        title: 'Products',
        icon: ShoppingBag,
        to: '/dashboard/analytics/products',
      },
      { title: 'Traffic', icon: Activity, to: '/dashboard/analytics/traffic' },
    ],
  },
  {
    title: 'Staff',
    icon: UserCog,
    to: '/dashboard/staff',
    children: [
      { title: 'All Staff', icon: UserCog, to: '/dashboard/staff' },
      { title: 'Add Member', icon: Plus, to: '/dashboard/staff/new' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    to: '/dashboard/settings',
    children: [
      { title: 'General', icon: Settings, to: '/dashboard/settings/general' },
      { title: 'Branding', icon: Palette, to: '/dashboard/settings/branding' },
      { title: 'Domain', icon: Globe, to: '/dashboard/settings/domain' },
      {
        title: 'Payments',
        icon: CreditCard,
        to: '/dashboard/settings/payments',
      },
      { title: 'Shipping', icon: Truck, to: '/dashboard/settings/shipping' },
      { title: 'Taxes', icon: Receipt, to: '/dashboard/settings/taxes' },
      {
        title: 'Notifications',
        icon: Bell,
        to: '/dashboard/settings/notifications',
      },
      { title: 'Billing', icon: Banknote, to: '/dashboard/settings/billing' },
    ],
  },
  {
    title: 'Account',
    icon: User,
    to: '/dashboard/account',
    children: [
      { title: 'Profile', icon: UserCircle, to: '/dashboard/account/profile' },
      { title: 'Password', icon: Lock, to: '/dashboard/account/password' },
      {
        title: 'Notifications',
        icon: Bell,
        to: '/dashboard/account/notifications',
      },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function isParentActive(item: (typeof navMain)[0], currentPath: string) {
  if (item.exact) return currentPath === item.to
  return currentPath.startsWith(item.to)
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const { user } = useGetMe()
  const { data: tenant } = useGetTenant()
  const { mutate: logoutMutation } = useLogOut()

  // Track which parent items are open
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    // Auto-open the active section on mount
    const initial: Record<string, boolean> = {}
    navMain.forEach((item) => {
      if (item.children && isParentActive(item, currentPath)) {
        initial[item.title] = true
      }
    })
    return initial
  })

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const handleLogout = () => logoutMutation(undefined)

  return (
    <Sidebar variant="inset">
      {/* ── Header ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 cursor-default select-none">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-base">Banau</span>
                  <span className="text-xs text-muted-foreground">
                    Website Builder
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent>
        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => {
              const active = isParentActive(item, currentPath)
              const isOpen = openItems[item.title] ?? false

              if (!item.children) {
                // Simple item – no sub-menu
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate({ to: item.to })}
                      isActive={active}
                      tooltip={item.title}
                      className="cursor-pointer"
                    >
                      <item.icon className="h-4 w-4 cursor-pointer" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }

              // Collapsible item with children
              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.title)}
                  asChild
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={active && !isOpen}
                        tooltip={item.title}
                        className="group/collapsible cursor-pointer"
                      >
                        <item.icon className="h-4 w-4 cursor-pointer" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 cursor-pointer" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const childActive = currentPath === child.to
                          return (
                            <SidebarMenuSubItem key={child.to}>
                              <SidebarMenuSubButton
                                onClick={() => navigate({ to: child.to })}
                                isActive={childActive}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <child.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground cursor-pointer" />
                                <span className="flex-1">{child.title}</span>
                                {child.badge === 'alert' && (
                                  <Badge
                                    variant="destructive"
                                    className="h-4 px-1 text-[10px] font-semibold"
                                  >
                                    !
                                  </Badge>
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Site Quick Links */}
        {tenant && (
          <SidebarGroup>
            <SidebarGroupLabel>Your Site</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate({ to: `/s/${tenant.subdomain}` })}
                  tooltip="Preview"
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4 cursor-pointer" />
                  <span>Preview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {tenant.published && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() =>
                      window.open(
                        `https://${tenant.subdomain}.banau.com`,
                        '_blank',
                      )
                    }
                    tooltip="View Live Site"
                    className="cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 cursor-pointer" />
                    <span>View Live</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ── Footer / User ── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs">
                      {getInitials(user?.data.firstName, user?.data.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.data.firstName} {user?.data.lastName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.data.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg text-xs">
                        {getInitials(user?.data.firstName, user?.data.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.data.firstName} {user?.data.lastName}
                      </span>
                      <span className="truncate text-xs">
                        {user?.data.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate({ to: '/dashboard/account/profile' })}
                >
                  <UserCircle className="mr-2 h-4 w-4 cursor-pointer" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({ to: '/dashboard/settings/general' })
                  }
                >
                  <Settings className="mr-2 h-4 w-4 cursor-pointer" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4 cursor-pointer" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
