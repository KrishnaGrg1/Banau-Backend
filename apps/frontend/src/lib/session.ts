// utils/session.ts
import { useSession } from '@tanstack/react-start/server'

type SessionData = {
  token: string
}

export function useAppSession() {
  return useSession<SessionData>({
    // Session configuration
    name: 'app-session',
    password: process.env.SESSION_SECRET || 'dev-secret-at-least-32-characters-long-change-in-production', // At least 32 characters
    // Optional: customize cookie settings
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  })
}
