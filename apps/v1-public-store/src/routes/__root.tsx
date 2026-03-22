import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

// import StoreDevtools from '../lib/demo-store-devtools'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'
import { getTenantConfig } from '#/serverFn/tenant.serverFn'

interface MyRouterContext {
  queryClient: QueryClient
}

type TenantSetting = {
  primaryColorCode?: string | null
  primaryTextColorCode?: string | null
  secondaryColorCode?: string | null
  secondaryTextColorCode?: string | null
  backgroundColorCode?: string | null
  backgroundTextColorCode?: string | null
}

const buildTenantThemeCssVars = (setting?: TenantSetting | null): string => {
  if (!setting) return ''

  const declarations: string[] = []

  if (setting.primaryColorCode) {
    declarations.push(`--primary:${setting.primaryColorCode};`)
  }

  if (setting.primaryTextColorCode) {
    declarations.push(`--primary-foreground:${setting.primaryTextColorCode};`)
  }

  if (setting.secondaryColorCode) {
    declarations.push(`--secondary:${setting.secondaryColorCode};`)
  }

  if (setting.secondaryTextColorCode) {
    declarations.push(
      `--secondary-foreground:${setting.secondaryTextColorCode};`,
    )
  }

  if (setting.backgroundColorCode) {
    declarations.push(`--background:${setting.backgroundColorCode};`)
  }

  if (setting.backgroundTextColorCode) {
    declarations.push(`--foreground:${setting.backgroundTextColorCode};`)
  }

  if (declarations.length === 0) return ''
  return `:root{${declarations.join('')}}`
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<MyRouterContext>()({
  staleTime: Infinity,
  loader: async () => {
    try {
      const tenantConfig = await getTenantConfig()
      return { tenantConfig }
    } catch (error) {
      if (error instanceof Response && error.status === 404) {
        return { tenantConfig: null }
      }
      throw error
    }
  },

  head: (ctx) => {
    const tenant = ctx.loaderData?.tenantConfig

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
    }
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { tenantConfig } = Route.useLoaderData()
  const tenantThemeCssVars = buildTenantThemeCssVars(
    tenantConfig?.existingSetting,
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {tenantThemeCssVars ? (
          <style dangerouslySetInnerHTML={{ __html: tenantThemeCssVars }} />
        ) : null}
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
