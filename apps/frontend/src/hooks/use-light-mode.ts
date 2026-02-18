import { useEffect } from 'react'

export function useForceLightMode(force: boolean) {
  useEffect(() => {
    if (!force) return

    const root = document.documentElement

    const prevHasDark = root.classList.contains('dark')
    const prevHasLight = root.classList.contains('light')

    // Force light
    root.classList.remove('dark')
    root.classList.add('light')

    return () => {
      root.classList.remove('light')

      if (prevHasDark) root.classList.add('dark')
      if (prevHasLight) root.classList.add('light')
    }
  }, [force])
}
