interface HeaderProps {
  tenant: {
    name: string
    subdomain: string
  }
  logo?: {
    url: string
  }
}

export default function Header({ tenant, logo }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur  border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            {logo?.url ? (
              <img src={logo.url} alt={tenant.name} className="h-8 w-auto" />
            ) : (
              <>
                <div className="h-8 w-8  rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {tenant.name.charAt(0)}
                  </span>
                </div>
                <span className="font-semibold text-foreground text-sm tracking-tight">
                  {tenant.name}
                </span>
              </>
            )}
          </div>

          {/* Navigation Centered */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <a
              href="#home"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors font-medium"
            >
              Home
            </a>
            <a
              href="#products"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors font-medium"
            >
              Products
            </a>
            <a
              href="#about"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors font-medium"
            >
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
