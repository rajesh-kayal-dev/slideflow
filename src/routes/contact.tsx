import { createFileRoute } from '@tanstack/react-router'
import { LandingNavbar } from '#/components/landing/LandingNavbar'
import { Footer } from '#/components/landing/Footer'
import { ContactSection, OfficeLocations } from '#/components/landing/ContactSection'
import { AuthModal } from '#/components/auth/AuthModal'
import { useState } from 'react'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode)
  }

  return (
    <div className="bg-bgDark2 min-h-screen text-primaryText font-sans selection:bg-primaryColor selection:text-white">
      <LandingNavbar onOpenAuth={handleOpenAuth} />
      <main>
        <ContactSection />
        <OfficeLocations />
      </main>
      <Footer onOpenAuth={handleOpenAuth} />

      <AuthModal 
        isOpen={authMode !== null} 
        onClose={() => setAuthMode(null)} 
        initialMode={authMode || 'login'} 
      />
    </div>
  )
}
