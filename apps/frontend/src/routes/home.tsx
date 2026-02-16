// @route /home

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Globe,
  Lock,
  Settings,
  Palette,
  Zap,
  Cpu,
  Check,
} from 'lucide-react'

export const Route = createFileRoute('/home')({
  component: Home,
})

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">banau</div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm hover:text-accent transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-sm hover:text-accent transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm hover:text-accent transition-colors"
            >
              Pricing
            </a>
          </div>
          <div>
            <ModeToggle />
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => navigate({ to: '/login' })}
            >
              Login
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => navigate({ to: '/register' })}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight mb-6">
              Launch Your Website in Seconds
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Create your own fully hosted website at yourname.banau.com — no
              hosting setup, no servers, no stress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => navigate({ to: '/register' })}
              >
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-secondary"
              >
                View Demo
              </Button>
            </div>
          </div>

          {/* Mock Preview */}
          <div className="hidden md:block">
            <div className="rounded-lg border border-border bg-secondary/50 p-8 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-accent/20 via-accent/10 to-background flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-12 h-12 text-accent mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      xyz.banau.com
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Live & Ready
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Register', icon: '👤' },
              { step: 2, title: 'Choose Your Name', icon: '📝' },
              { step: 3, title: 'Go Live Instantly', icon: '⚡' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Step {item.step}: {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.step === 1 && 'Create your account in seconds'}
                  {item.step === 2 && 'Pick your unique subdomain'}
                  {item.step === 3 && 'Your website is online immediately'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Instant Subdomain Hosting', icon: Globe },
              { title: 'Secure & Scalable Infrastructure', icon: Lock },
              { title: 'Admin Dashboard', icon: Settings },
              { title: 'Customizable Templates', icon: Palette },
              { title: 'SEO Ready', icon: Zap },
              { title: 'API-Driven Backend', icon: Cpu },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="p-6 border border-border rounded-lg hover:border-accent transition-colors hover:bg-secondary/50"
                >
                  <Icon className="w-8 h-8 text-accent mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Everything you need to succeed
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Banau?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-6 text-muted-foreground">
                Traditional Hosting
              </h3>
              <ul className="space-y-3">
                {[
                  'Buy domain',
                  'Configure DNS',
                  'Setup hosting',
                  'Install CMS',
                  'Maintain server',
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <span className="text-lg">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Banau</h3>
              <ul className="space-y-3">
                {['Register', 'Done'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Example Subdomains */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Create Your Website
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'cafe.banau.com', desc: 'Coffee Shop' },
              { name: 'studio.banau.com', desc: 'Design Studio' },
              { name: 'portfolio.banau.com', desc: 'Creator Portfolio' },
            ].map((domain, i) => (
              <div
                key={i}
                className="p-6 border border-border rounded-lg bg-secondary/50"
              >
                <Globe className="w-6 h-6 text-accent mb-3" />
                <p className="font-mono text-sm font-semibold mb-1">
                  {domain.name}
                </p>
                <p className="text-sm text-muted-foreground">{domain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Simple Pricing
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Choose the plan that grows with you
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: '$9',
                features: [
                  '1 Website',
                  'Basic Analytics',
                  'Email Support',
                  'Custom Domain',
                ],
              },
              {
                name: 'Pro',
                price: '$29',
                features: [
                  'Unlimited Websites',
                  'Advanced Analytics',
                  'Priority Support',
                  'API Access',
                  'Custom Domain',
                ],
                popular: true,
              },
              {
                name: 'Business',
                price: '$99',
                features: [
                  'Everything in Pro',
                  'White Label',
                  'Dedicated Support',
                  'Custom Integrations',
                  'SLA Guarantee',
                ],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-lg p-8 transition-all ${plan.popular ? 'border-2 border-accent bg-secondary/80 scale-105' : 'border border-border bg-background'}`}
              >
                {plan.popular && (
                  <p className="text-accent text-sm font-bold mb-4">
                    MOST POPULAR
                  </p>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-accent mb-6">
                  {plan.price}
                  <span className="text-sm text-muted-foreground">/mo</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Launch?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators and entrepreneurs who are already
            building on Banau
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Create Your Website Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-lg font-bold mb-4">banau</p>
              <p className="text-sm opacity-75">
                The instant website builder for everyone
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Contact'] },
            ].map((col, i) => (
              <div key={i}>
                <p className="font-semibold mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-sm opacity-75 hover:opacity-100 transition-opacity"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-75">
            <p>&copy; 2024 Banau. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
