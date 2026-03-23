import { normalizeHostname } from '#/lib/normalizeHostname'
import { getTenantDetailsBySubdomain } from '#/lib/services/tenant-services'
import { createServerFn } from '@tanstack/react-start'
import { getRequestUrl } from '@tanstack/react-start/server'
const hostnameToSubdomain = (hostname: string): string => {
  const normalized = normalizeHostname(hostname).toLowerCase()
  return normalized.split('.')[0]
}

export const getTenantConfigByHostname = async ({ hostname }: { hostname: string }) => {
  const subdomain = hostnameToSubdomain(hostname)
  try {
    return await getTenantDetailsBySubdomain({
      data: { subdomain },
    })
  } catch {
    return null
  }
}

export const getTenantConfig = createServerFn().handler(async () => {
  const url = getRequestUrl()
  const hostname = normalizeHostname(url.hostname)

  const tenantConfig = await getTenantConfigByHostname({ hostname })

  if (!tenantConfig) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw new Response('Tenant Not Found', { status: 404 })
    // throw notFound()
  }

  return tenantConfig
})
