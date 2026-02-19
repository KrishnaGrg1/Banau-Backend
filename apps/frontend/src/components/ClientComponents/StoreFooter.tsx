import { Tenant } from '@repo/db/dist/generated/prisma/client'
import { Card, CardContent } from '@/components/ui/card'

interface StoreFooterProps {
  tenant: Tenant
}

const StoreFooter = ({ tenant }: StoreFooterProps) => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-secondary">
      <Card className="mx-auto max-w-7xl border-none shadow-none bg-secondary">
        <CardContent className="px-4 py-6 sm:px-4 lg:px-6 flex flex-col items-center gap-6 text-center">
          <span className="text-2xl ">{tenant.name}</span>
          <div className="flex gap-10">
            {['home', 'products', 'about'].map((link) => (
              <a
                key={link}
                href={`#${link}`}
                className="text-xs font-medium  uppercase  transition-opacity hover:opacity-70"
              >
                {link}
              </a>
            ))}
          </div>
          <a
            href={`mailto:${tenant.email}`}
            className="text-xs  text-muted-foreground transition-opacity hover:opacity-70"
          >
            {tenant.email}
          </a>
          <div className="mt-6 flex flex-col items-center gap-2 w-full border-t border-primary pt-4">
            <p className="text-[10px] text-muted-foreground">
              © {year} {tenant.name}. All rights reserved.
            </p>
            <p className="text-[10px] tracking-wider text-muted-foreground">
              Powered by{' '}
              <a
                href="https://banau.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-opacity hover:opacity-60"
              >
                Banau
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </footer>
  )
}

export default StoreFooter
