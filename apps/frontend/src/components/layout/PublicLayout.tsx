import { ReactNode } from 'react'

interface PublicLayoutProps {
  children: ReactNode
  siteName?: string
}

export function PublicLayout({
  children,
  siteName = 'Banau Site',
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{siteName}</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">{children}</main>
      <footer className="mt-auto border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            Powered by{' '}
            <span className="font-semibold text-gray-900">Banau</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
