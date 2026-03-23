// lib/normalizeHostname.ts
export const normalizeHostname = (hostname: string): string => {
  // Handle local development subdomains like tenant.localhost:3000
  if (hostname.includes('localhost')) {
    return hostname.replace('.localhost', '').split(':')[0]
  }
  return hostname
}
