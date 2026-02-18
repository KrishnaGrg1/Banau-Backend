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
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useLogOut } from '@/hooks/user-auth'
import { useGetMe } from '@/hooks/use-user'
import { useGetTenant } from '@/hooks/use-tenant'
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Settings,
  Building2,
  Sparkles,
  Eye,
  ExternalLink,
  LogOut,
  ChevronUp,
} from 'lucide-react'

const navMain = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    to: '/dashboard',
  },
  {
    title: 'Products',
    icon: ShoppingBag,
    to: '/dashboard/products',
  },
  {
    title: 'Orders',
    icon: ClipboardList,
    to: '/dashboard/orders',
  },
  {
    title: 'Tenant',
    icon: Building2,
    to: '/dashboard/tenants',
  },
  {
    title: 'Settings',
    icon: Settings,
    to: '/dashboard/settings',
  },
]

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export function AppSidebar() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const { user } = useGetMe()
  const { data: tenant } = useGetTenant()
  const { mutate: logoutMutation } = useLogOut()

  const handleLogout = () => logoutMutation(undefined)

  return (
    <Sidebar variant="inset">
      {/* Header / Brand */}
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

      {/* Content */}
      <SidebarContent>
        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => navigate({ to: item.to })}
                  isActive={currentPath === item.to}
                  tooltip={item.title}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Site quick links — only shown when tenant exists */}
        {tenant && (
          <SidebarGroup>
            <SidebarGroupLabel>Your Site</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() =>
                    navigate({ to: `/preview/${tenant.subdomain}` })
                  }
                  tooltip="Preview"
                >
                  <Eye className="h-4 w-4" />
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
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Live</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer / User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
                  onClick={() => navigate({ to: '/dashboard/settings' })}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
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
