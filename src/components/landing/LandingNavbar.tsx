import { Link, useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export function LandingNavbar({ onOpenAuth }: { onOpenAuth?: (mode?: 'login' | 'signup') => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Features', to: '/', hash: 'features' },
    { label: 'Pricing', to: '/', hash: 'pricing' },
    { label: 'Contact', to: '/contact' },
  ]

  const isActive = (to: string, hash?: string) => {
    if (hash) return location.hash === hash
    return location.pathname === to && !location.hash
  }

  return (
    <nav
      className={`w-full h-20 flex flex-col justify-center items-center fixed z-40 transition-all duration-300 ${
        isScrolled ? 'bg-bgDark1/70 backdrop-blur-[15px] border-b border-mainBorderDarker' : ''
      }`}
    >
      <div className="relative flex w-11/12 items-center justify-between xl:w-10/12">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/SlideFlowLogo.png" alt="SlideFlow" className="h-8 w-auto shrink-0" />
          <div className="font-['Outfit'] text-xl font-extrabold tracking-tight text-white">
            Slide<span className="text-gradient-primary">Flow</span>
          </div>
        </Link>

        {/* Desktop nav links - Centered */}
        <div className="hidden h-full lg:flex items-center gap-1">
          {navLinks.map(({ label, to, hash }) => (
            <Link
              key={label}
              to={to}
              hash={hash}
              className={`relative flex h-20 cursor-pointer items-center px-4 text-sm font-medium transition duration-200 hover:text-indigo-200 2xl:px-6 ${
                isActive(to, hash) ? 'text-white' : 'text-white/70'
              }`}
            >
              {label}
              {isActive(to, hash) && (
                <span className="bg-secondaryColor absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => onOpenAuth?.('login')}
            className="main-border-gray bg-bgDark2 hover:bg-bgDark3 flex items-center rounded-xl py-2 px-5 text-sm text-white font-medium transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth?.('signup')}
            className="contained-button h-9 px-5 text-sm"
          >
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="border-mainBorder hover:bg-bgDark2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-solid p-2.5 gap-1.5 lg:hidden transition-colors"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
        >
          <div className={`h-0.5 w-5 bg-gray-400 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`h-0.5 w-5 bg-gray-400 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
          <div className={`h-0.5 w-5 bg-gray-400 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="bg-bgDark1/95 backdrop-blur-xl border-t border-mainBorderDarker absolute top-20 left-0 w-full flex flex-col items-center gap-2 py-6 px-4 lg:hidden z-50">
          {navLinks.map(({ label, to, hash }) => (
            <Link
              key={label}
              to={to}
              hash={hash}
              onClick={closeMobileMenu}
              className="w-full text-center py-3 text-lg text-white/80 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col w-full gap-2 mt-4 pt-4 border-t border-mainBorderDarker">
            <button
              onClick={() => {
                closeMobileMenu()
                onOpenAuth?.('login')
              }}
              className="outlined-button w-full h-11 flex items-center justify-center font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                closeMobileMenu()
                onOpenAuth?.('signup')
              }}
              className="contained-button w-full h-11 text-sm font-semibold"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
