import { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

export function AdminLayout({
  children,
  title = 'Banau Admin',
}: AdminLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/website' })}
            >
              Website
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
