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
import { useLogOut } from '@/hooks/user-auth'
import { useGetMe } from '@/hooks/use-user'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  UserCog,
  Settings,
  Sparkles,
  LogOut,
  ChevronUp,
  ChevronRight,
  UserCircle,
  Sliders,
} from 'lucide-react'

const navMain = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    to: '/admin',
    exact: true,
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    to: '/admin/analytics',
    children: [
      { title: 'Overview', icon: BarChart3, to: '/admin/analytics' },
      { title: 'Growth', icon: TrendingUp, to: '/admin/analytics/growth' },
      { title: 'Revenue', icon: DollarSign, to: '/admin/analytics/revenue' },
    ],
  },
  {
    title: 'Tenants',
    icon: Building2,
    to: '/admin/tenants',
  },
  {
    title: 'Users',
    icon: Users,
    to: '/admin/users',
    children: [
      { title: 'All Users', icon: Users, to: '/admin/users' },
      { title: 'Roles', icon: UserCog, to: '/admin/users/roles' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    to: '/admin/setting',
    children: [
      { title: 'Features', icon: Sliders, to: '/admin/setting/features' },
      { title: 'Plans', icon: Settings, to: '/admin/setting/plans' },
      { title: 'System', icon: Settings, to: '/admin/setting/system' },
    ],
  },
]

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function isParentActive(item: (typeof navMain)[0], currentPath: string) {
  if (item.exact) return currentPath === item.to
  return currentPath.startsWith(item.to)
}

export function AdminSidebar() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const { user } = useGetMe()
  const { mutate: logoutMutation } = useLogOut()

  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
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

  const handleLogout = () => logoutMutation({})

  return (
    <Sidebar variant="inset">
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
                    Admin Console
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => {
              const active = isParentActive(item, currentPath)
              const isOpen = openItems[item.title] ?? false

              if (!item.children) {
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
      </SidebarContent>

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
