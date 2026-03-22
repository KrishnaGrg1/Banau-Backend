
import { normalizeHostname } from '#/lib/normalizeHostname'
import { getTenantDetailsBySubdomain } from '#/lib/services/tenant-services'
import { createServerFn } from '@tanstack/react-start'
import { getRequestUrl } from '@tanstack/react-start/server'


const hostnameToSubdomain = (hostname: string): string => {
    const normalized = normalizeHostname(hostname).toLowerCase()
    return normalized.split('.')[0] ?? normalized
}

export const getTenantConfigByHostname = async ({
    hostname,
}: {
    hostname: string
}) => {
    const subdomain = hostnameToSubdomain(hostname)
    const data = await getTenantDetailsBySubdomain({
        data: { subdomain },
    })

    return data ?? null
}

export const getTenantConfig = createServerFn().handler(async () => {
    const url = getRequestUrl()
    const hostname = normalizeHostname(url.hostname)

    const tenantConfig = await getTenantConfigByHostname({ hostname })

    if (!tenantConfig) {
        throw new Response('Tenant Not Found', { status: 404 })
    }

    return tenantConfig
})