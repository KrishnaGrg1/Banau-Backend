import { useEffect } from 'react'
import { Asset, Setting } from '@repo/db/dist/generated/prisma/client'
import { useTheme } from '@/components/theme-provider'

export function useBrandTheme(
  setting?: Setting | null,
  logo?: Asset | null,
  favicon?: Asset | null,
  domain?: string | null,
) {
  const { theme } = useTheme()

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!setting) return

    const root = document.documentElement
    const style = root.style

    const vars = [
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--background',
      '--foreground',
    ]

    const prevVars: Record<string, string> = {}

    vars.forEach((v) => {
      prevVars[v] = style.getPropertyValue(v)
    })

    if (setting.primaryColorCode)
      style.setProperty('--primary', setting.primaryColorCode)

    if (setting.primaryTextColorCode)
      style.setProperty(
        '--primary-foreground',
        setting.primaryTextColorCode,
      )

    if (setting.secondaryColorCode)
      style.setProperty('--secondary', setting.secondaryColorCode)

    if (setting.secondaryTextColorCode)
      style.setProperty(
        '--secondary-foreground',
        setting.secondaryTextColorCode,
      )

    if (setting.backgroundColorCode)
      style.setProperty('--background', setting.backgroundColorCode)

    if (setting.backgroundTextColorCode)
      style.setProperty(
        '--foreground',
        setting.backgroundTextColorCode,
      )

    // ---------- FAVICON ----------
    let link =
      document.querySelector<HTMLLinkElement>("link[rel*='icon']")

    const prevFavicon = link?.href ?? null

    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    link.href =
      logo?.url ||
      favicon?.url ||
      '/favicon.ico'

    // ---------- TITLE ----------
    const prevTitle = document.title

    if (domain) {
      document.title = `Banau x ${domain}`
    }

    return () => {
      Object.entries(prevVars).forEach(([k, v]) => {
        if (v) style.setProperty(k, v)
        else style.removeProperty(k)
      })

      if (link && prevFavicon) link.href = prevFavicon

      document.title = prevTitle
    }
  }, [
    setting,
    logo?.url,
    favicon?.url,
    domain,
    theme, // 🔥 critical: reapply after theme changes
  ])
}
