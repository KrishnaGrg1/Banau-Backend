import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { isAdminSite } from '@/utils/host'
import { useAuth } from '@/hooks/use-auth'
import { PublicWebsite } from '@/components/PublicWebsite'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const navigate = useNavigate()
  const admin = isAdminSite()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // If admin site
    if (admin) {
      if (!isLoading) {
        if (isAuthenticated) {
          // Redirect authenticated users to dashboard
          navigate({ to: '/dashboard' })
        } else {
          // Redirect unauthenticated users to login
          navigate({ to: '/login' })
        }
      }
    }
  }, [admin, isAuthenticated, isLoading, navigate])

  // If admin site, show loading while redirecting
  if (admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Otherwise, render public website
  return <PublicWebsite />
}
