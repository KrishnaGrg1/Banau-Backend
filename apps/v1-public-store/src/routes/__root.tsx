import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'
import { getTenantConfig } from '#/serverFn/tenant.serverFn'
import type { Setting } from '@repo/db/dist/generated/prisma/client'
import appCss from '../styles.css?url'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
interface MyRouterContext {
  queryClient: QueryClient
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        The page you requested does not exist or is no longer available.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  )
}

const buildTenantThemeCssVars = (setting?: Setting | null): string => {
  if (!setting) return ''

  const vars: string[] = []
  const body: string[] = []

  if (setting.primaryColorCode) {
    vars.push(`--primary:${setting.primaryColorCode};`)
  }
  if (setting.primaryTextColorCode) {
    vars.push(`--primary-foreground:${setting.primaryTextColorCode};`)
  }
  if (setting.secondaryColorCode) {
    vars.push(`--secondary:${setting.secondaryColorCode};`)
  }
  if (setting.secondaryTextColorCode) {
    vars.push(`--secondary-foreground:${setting.secondaryTextColorCode};`)
  }
  if (setting.backgroundColorCode) {
    vars.push(`--background:${setting.backgroundColorCode};`)
    body.push(`background-color:${setting.backgroundColorCode};`)
  }
  if (setting.backgroundTextColorCode) {
    vars.push(`--foreground:${setting.backgroundTextColorCode};`)
    body.push(`color:${setting.backgroundTextColorCode};`)
  }

  if (vars.length === 0) return ''

  const rootBlock = `:root{${vars.join('')}}`
  const bodyBlock = body.length > 0 ? `body{${body.join('')}}` : ''

  return `${rootBlock}${bodyBlock}`
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  staleTime: Infinity,
  loader: async () => {
    try {
      const tenantConfig = await Promise.race([
        getTenantConfig(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Loader timeout')), 8000),
        ),
      ])
      return { tenantConfig }
    } catch (error) {
      if (error instanceof Response && error.status === 404) {
        return { tenantConfig: null }
      }
      // ✅ instead of re-throwing (which hangs the worker), return null
      console.error('getTenantConfig failed:', error)
      return { tenantConfig: null }
    }
  },

  head: (ctx) => {
    const tenant = ctx.loaderData?.tenantConfig

    if (!tenant) {
      return {
        meta: [
          { title: 'Default App' },
          { name: 'description', content: 'Welcome to our store' },
          { name: 'theme-color', content: '#ffffff' },
        ],
        links: [{ rel: 'icon', href: '/favicon.ico' }],
        styles: [],
      }
    }

    const tenantThemeCssVars = buildTenantThemeCssVars(tenant.existingSetting)

    return {
      meta: [
        { title: tenant.existingTenant.name },
        {
          name: 'description',
          content: tenant.existingSetting.landingPageDescription,
        },
        { property: 'og:image', content: tenant.logo.url },
      ],
      links: [
        { rel: 'icon', href: tenant.favicon.url },
        {
          rel: 'stylesheet',
          href: appCss,
        },
      ],
      styles: tenantThemeCssVars ? [{ children: tenantThemeCssVars }] : [],
    }
  },
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /> */}
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <ThemeProvider defaultTheme="light">
          <TanStackQueryProvider>
            {children}
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            />
          </TanStackQueryProvider>
          <Toaster position="bottom-right" />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}
