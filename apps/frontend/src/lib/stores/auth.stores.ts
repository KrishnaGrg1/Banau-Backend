import { create } from 'zustand'
import { persist,  createJSONStorage } from 'zustand/middleware'
import { User } from '@repo/shared'

interface AuthState {
  isAuthenticated: boolean
  user?: User
  token?: string
  setUser: (user: User | undefined) => void
  setAuthSession: (token: string | undefined) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        isAuthenticated: false,
        user: undefined,
        token: undefined,

        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false),

        setAuthSession: (token) => set({ token }, false),
        setAuthenticated: (value) => set({ isAuthenticated: value }),
        logout: () =>
          set(
            { user: undefined, token: undefined, isAuthenticated: false },
            false,
          ),
      }),
      {
        name: 'auth-storage', // unique name for localStorage key
        storage: createJSONStorage(() => localStorage),
        // Optional: only save the token and user, not UI state
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        // Rehydrate isAuthenticated based on token/user presence
        onRehydrateStorage: () => (state) => {
          if (state && (state.token || state.user)) {
            state.isAuthenticated = true
          }
        },
      },
    ),
)
