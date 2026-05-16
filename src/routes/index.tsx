import { getSession } from '@/lib/auth.functions'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { LandingNavbar } from '#/components/landing/LandingNavbar'
import { LandingHero } from '#/components/landing/LandingHero'
import { TrustedBrands } from '#/components/landing/TrustedBrands'
import { PreviewCarousel } from '#/components/landing/PreviewCarousel'
import { BentoFeatures } from '#/components/landing/BentoFeatures'
import { FeatureDiagonal } from '#/components/landing/FeatureDiagonal'
import { FeatureSection1 } from '#/components/landing/FeatureSection1'
import { FeatureSection2 } from '#/components/landing/FeatureSection2'
import { Testimonials } from '#/components/landing/Testimonials'
import { ScrollUpButton } from '#/components/landing/ScrollUpButton'
import { PricingSection } from '#/components/landing/PricingSection'
import { FAQSection } from '#/components/landing/FAQSection'
import { CTASection } from '#/components/landing/CTASection'
import { Footer } from '#/components/landing/Footer'
import { LandingBackground } from '#/components/landing/LandingBackground'

import { AuthModal } from '#/components/auth/AuthModal'
import { useState, useEffect } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/')({
  validateSearch: z.object({
    auth: z.enum(['login', 'signup']).optional(),
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData({
      queryKey: ['session'],
      queryFn: () => getSession(),
      staleTime: 1000 * 60 * 5,
    })

    if (session?.user) {
      throw redirect({ to: '/workspace' })
    }
    return { user: null }
  },
  component: IndexPage,
})

function IndexPage() {
  const { auth } = Route.useSearch()
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)

  useEffect(() => {
    if (auth) {
      setAuthMode(auth)
    }
  }, [auth])

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode)
  }

  return (
    <div className="min-h-screen text-primaryText font-sans selection:bg-primaryColor selection:text-white relative overflow-x-hidden">
      <LandingBackground />
      <LandingNavbar onOpenAuth={handleOpenAuth} />
      <main className="relative z-10">
        <LandingHero onOpenAuth={() => handleOpenAuth('signup')} />
        <BentoFeatures />
        <FeatureDiagonal />
        <FeatureSection1 className="bg-transparent backdrop-blur-sm" />
        <FeatureDiagonal reverse />
        <FeatureSection2 className="bg-transparent backdrop-blur-sm" />
        <Testimonials />
        <PricingSection onOpenAuth={handleOpenAuth} />
        <TrustedBrands />
        <PreviewCarousel />
        <FAQSection />
        <CTASection onOpenAuth={() => handleOpenAuth('signup')} />
        <ScrollUpButton />
      </main>
      <Footer onOpenAuth={handleOpenAuth} className="relative z-10" />

      <AuthModal
        isOpen={authMode !== null}
        onClose={() => setAuthMode(null)}
        initialMode={authMode || 'login'}
      />
    </div>
  )
}
