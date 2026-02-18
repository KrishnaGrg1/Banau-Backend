import { Asset, Setting } from '@repo/db/dist/generated/prisma/client'
import { useEffect } from 'react'

export function useBrandTheme(
  setting: Setting,
  logo: Asset,
  favicon: Asset,
  domain: string,
) {
  useEffect(() => {
    if (!setting) return

    // Store previous CSS variable values
    const root = document.documentElement.style
    const prevVars: Record<string, string> = {
      '--primary': root.getPropertyValue('--primary'),
      '--primary-foreground': root.getPropertyValue('--primary-foreground'),
      '--secondary': root.getPropertyValue('--secondary'),
      '--secondary-foreground': root.getPropertyValue('--secondary-foreground'),
      '--background': root.getPropertyValue('--background'),
      '--foreground': root.getPropertyValue('--foreground'),
    }

    // Apply new theme variables
    root.setProperty('--primary', setting.primaryColorCode)
    root.setProperty('--primary-foreground', setting.primaryTextColorCode)
    root.setProperty('--secondary', setting.secondaryColorCode)
    root.setProperty('--secondary-foreground', setting.secondaryTextColorCode)
    root.setProperty('--background', setting.backgroundColorCode)
    root.setProperty('--foreground', setting.backgroundTextColorCode)

    // Store previous favicon
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    let prevFaviconHref = link ? link.href : ''
    if (!link) {
      link = document.createElement('link')
      link.rel = 'shortcut icon'
      document.head.appendChild(link)
    }
    // Set new favicon (use logo for preview)
    if (logo?.url) {
      link.href = logo.url
    } else if (favicon?.url) {
      link.href = favicon.url
    } else {
      link.href = '/favicon.ico'
    }
    link.type = 'image/x-icon'

    // Store previous title
    const title = document.querySelector('title') as HTMLTitleElement
    const prevTitle = title ? title.innerHTML : ''
    if (title && domain) title.innerHTML = 'Banau x ' + domain

    // Cleanup: restore previous values on unmount
    return () => {
      Object.entries(prevVars).forEach(([key, value]) => {
        root.setProperty(key, value)
      })
      if (link && prevFaviconHref) link.href = prevFaviconHref
      if (title && prevTitle) title.innerHTML = prevTitle
    }
  }, [setting, logo, favicon, domain])
}
