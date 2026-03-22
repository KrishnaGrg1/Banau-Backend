import {
  HeadContent,
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

interface MyRouterContext {
  queryClient: QueryClient
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

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

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
    const tenantThemeCssVars = buildTenantThemeCssVars(tenant?.existingSetting)

    return {
      meta: [
        { title: tenant?.existingTenant?.name ?? 'Default App' },
        {
          name: 'description',
          content:
            tenant?.existingSetting?.landingPageDescription ??
            'Welcome to our store',
        },
        {
          name: 'theme-color',
          content: tenant?.existingSetting?.primaryColorCode ?? '#ffffff',
        },
        { property: 'og:image', content: tenant?.logo?.url },
      ],
      links: [{ rel: 'icon', href: tenant?.favicon?.url ?? '/favicon.ico' }],
      styles: tenantThemeCssVars ? [{ children: tenantThemeCssVars }] : [],
    }
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
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
        <Scripts />
      </body>
    </html>
  )
}
