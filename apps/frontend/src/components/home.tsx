// @route /home  —  Banau Marketing Homepage
// All sections are extracted components from '@/components/marketing'

import { Nav } from '@/components/Home/NavBar'
import { Hero } from '@/components/Home/Hero'
import { HowItWorks } from '@/components/Home/HowitWorks'
import { Features } from '@/components/Home/Features'
import { WhyBanau } from '@/components/Home/Whybanau'
import { Domains } from '@/components/Home/Domains'
import { Pricing } from '@/components/Home/Pricing'
import { CTA } from '@/components/Home/Cta'
import { Footer } from '@/components/Home/Footer'

export default function Home() {
  // console.log('HOme rendered')
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <WhyBanau />
      <Domains />
      {/* <Pricing /> */}
      <CTA />
      <Footer />
    </div>
  )
}
