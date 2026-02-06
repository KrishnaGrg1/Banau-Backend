import { create } from 'zustand'
import { persist, devtools, createJSONStorage } from 'zustand/middleware'
import { Website } from '@repo/shared'
// import { getWebsiteDetailsBySubdomain } from '../services/website.service'

interface WebsiteStore {
  website: Website | undefined
  // loading: boolean
  setWebsite: (webiste: Website | undefined) => void
  // fetchWebsite: (subdomain: string) => Promise<void>
  clearWebsite: () => void
  // cleanOldCache: (currentSubdomain: string) => void
}

export const useWebsiteStore = create<WebsiteStore>()(
  devtools(
    persist(
      (set) => ({
        website: undefined,
        loading: false,
        setWebsite: (website) => set({ website }, false, 'website'),

        // fetchWebsite: async (subdomain) => {
        //   set({ loading: true }, false, 'website/fetch-start')

        //   try {
        //     // Check cache first
        //     const cached = localStorage.getItem(`website_${subdomain}`)
        //     if (cached) {
        //       const cachedWebsite = JSON.parse(cached) as Website
        //       set(
        //         { website: cachedWebsite, loading: false },
        //         false,
        //         'website/fetch-cached',
        //       )

        //       // Optional: fetch fresh data in background
        //       const res = await getWebsiteDetailsBySubdomain(subdomain!)
        //       if (res) {
        //         set(
        //           { website: res, loading: false },
        //           false,
        //           'website/fetch-success',
        //         )
        //       }
        //       return
        //     }

        //     // Fetch from API
        //     const res = await getWebsiteDetailsBySubdomain(subdomain!)
        //     if (!res) {
        //       throw new Error('Website not found')
        //     }

        //     set(
        //       { website: res, loading: false },
        //       false,
        //       'website/fetch-success',
        //     )

        //   } catch (err) {
        //     console.error('Failed to fetch website data:', err)
        //     set(
        //       { website: undefined, loading: false },
        //       false,
        //       'website/fetch-error',
        //     )
        //   }
        // },
        clearWebsite: () => set({ website: undefined }, false, 'website/clear'),

        // cleanOldCache: (currentSubdomain: string) => {
        //   try {
        //     Object.keys(localStorage).forEach((key) => {
        //       if (
        //         key.startsWith('website_') &&
        //         key !== `website_${currentSubdomain}`
        //       ) {
        //         localStorage.removeItem(key)
        //       }
        //     })
        //   } catch (err) {
        //     console.error('Failed to clean old website cache:', err)
        //   }
        // },
      }),
      {
        name: 'website-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          website: state.website,
        }),
      },
    ),
    { name: 'WebsiteStore' },
  ),
)
