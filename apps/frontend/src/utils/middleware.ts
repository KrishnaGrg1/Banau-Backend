import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { useAppSession } from '@/lib/session'
import { Asset, Setting, Tenant } from '@repo/db/dist/generated/prisma/client'
// import { useWebsiteStore } from '@/lib/stores/website.stores'
// import { getWebsiteDetailsBySubdomain } from '@/lib/services/website.service'

const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost:3000'

function extractSubdomain(request: Request): string | null {
  const url = request.url
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0]

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/)
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1]
    }
    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0]
    }
    return null
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0]

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---')
    return parts.length > 0 ? parts[0] : null
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`)

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null
}

export const subdomainMiddleware = createMiddleware().server(
  async ({ request, next }) => {
    const subdomain = extractSubdomain(request)
    // const {set}=useWebsiteStore()
    // console.log('subdomain from middleware', subdomain)

    return next({
      context: {
        subdomain,
      },
    })
  },
)

export const AuthMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await useAppSession()

  // Redirect to login if not authenticated
  if (!session.data.accessToken) {
    throw redirect({
      to: '/login',
    })
  }

  return next()
})

export const adminProtectionMiddleware = createMiddleware().server(
  ({ request, next, context }) => {
    const url = new URL(request.url)
    const subdomain = (context as unknown as { subdomain?: string | null })
      ?.subdomain

    // Block access to admin page from subdomains
    if (subdomain && url.pathname.startsWith('/admin')) {
      throw redirect({
        to: '/',
      })
    }

    return next()
  },
)

export const getServerData = createServerFn()
  .middleware([subdomainMiddleware])
  .handler(async ({ context }) => {
    // Access the user data from the context
    const { subdomain } = context
    let tenantData = null
    if (subdomain) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${subdomain}`,
        )
        const json = await res.json() as { data: {
          "existingTenant":  Tenant,
        "existingSetting":Setting,
        "logo":Asset,
        "favicon":Asset
        } }
         tenantData = json.data
      } catch (err) {
        console.error('Failed to fetch tenant:', err)
      }
    }
    console.log('tenant', tenantData)
    // Return the data to the client
    return {
      tenant: tenantData,
      subdomain,
    }
  })
