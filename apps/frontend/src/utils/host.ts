/**
 * Utility functions for detecting subdomain and determining UI context
 */

export function getSubdomain(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  // Check if we're in preview mode
  const path = window.location.pathname
  const previewMatch = path.match(/^\/preview\/([^/]+)/)
  if (previewMatch) {
    return previewMatch[1]
  }

  const hostname = window.location.hostname
  
  // Handle localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'admin' // Default to admin for local dev
  }

  // Split hostname by dots
  const parts = hostname.split('.')
  
  // If only domain (banau.com), treat as admin
  if (parts.length <= 2) {
    return 'admin'
  }

  // Return first part as subdomain
  return parts[0]
}

export function isAdminSite(): boolean {
  const subdomain = getSubdomain()
  return subdomain === 'admin' || subdomain === null
}

export function isPublicSite(): boolean {
  return !isAdminSite()
}

export function getPublicSubdomain(): string | null {
  if (isAdminSite()) {
    return null
  }
  return getSubdomain()
}
