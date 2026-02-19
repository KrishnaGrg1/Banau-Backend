import { Setting } from '@repo/db/dist/generated/prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface StoreHeroProps {
  setting: Setting
}

const StoreHero = ({ setting }: StoreHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-background py-10 sm:py-16 lg:py-20 flex items-center justify-center">
      <Card className="relative w-full max-w-3xl px-2 sm:px-4 lg:px-6 bg-transparent border-none shadow-none flex">
        <CardContent className="p-4 sm:p-6 flex flex-col items-start w-full">
          <Badge className="mb-6 uppercase tracking-wide" variant="secondary">
            <span className="h-2 w-2 rounded-full bg-primary mr-2 inline-block" />
            Now Open
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
            {setting.landingPageTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl text-muted-foreground">
            {setting.landingPageDescription}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <a href="#products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#about">Learn More</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default StoreHero
