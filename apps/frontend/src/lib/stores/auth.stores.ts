import { create } from 'zustand'
import { persist, devtools, createJSONStorage } from 'zustand/middleware'
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
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        user: undefined,
        token: undefined,

        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, 'auth/setUser'),

        setAuthSession: (token) => set({ token }, false, 'auth/setSession'),
        setAuthenticated: (value) => set({ isAuthenticated: value }),
        logout: () =>
          set(
            { user: undefined, token: undefined, isAuthenticated: false },
            false,
            'auth/logout',
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
      },
    ),
    { name: 'AuthStore' },
  ),
)
