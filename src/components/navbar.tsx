import { signOut } from '#/lib/auth-client'
import { Link, useRouterState, useRouter, useRouteContext } from '@tanstack/react-router'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function useShouldHideNavbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { user } = useRouteContext({ from: '/' }) as { user: any }
  if (pathname === '/' && user) return true
  if (pathname.startsWith('/presentations/')) return true
  return false
}

export default function Navbar() {
  const router = useRouter()
  const { user } = useRouteContext({ from: '/' }) as { user: any }
  const [theme, setTheme] = useState<Theme>('dark')
  const hideNavbar = useShouldHideNavbar()

  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  if (hideNavbar) return null

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.reload()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <nav className="mx-auto max-w-6xl px-4 pt-4">
        <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-white/10 bg-bgDark1/85 backdrop-blur-xl px-5 h-14 shadow-lg shadow-black/30">

          {/* ── Brand ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
            <img src="/SlideFlowLogo.png" alt="SlideFlow" className="h-8 w-auto shrink-0" />
            <span className="font-extrabold tracking-tight text-white text-base hidden sm:block">
              Slide<span className="text-gradient-primary">Flow</span>
            </span>
          </Link>

          {/* ── Center nav links (public only) ── */}
          {!user && (
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="px-4 py-1.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {label}
                </a>
              ))}
            </div>
          )}

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </button>

            {/* Auth area */}
            {user ? (
              /* Authenticated: user avatar dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="relative h-9 w-9 rounded-full border-2 border-primaryColor/50 hover:border-primaryColor transition-all focus:outline-none focus:border-primaryColor"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
                      <AvatarFallback className="bg-primaryColor/30 text-primaryColor font-bold text-sm">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : <User className="h-4 w-4" />
                        }
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-bgDark1 border border-white/10 shadow-2xl rounded-xl mt-1"
                >
                  <DropdownMenuLabel className="font-normal px-3 py-2.5">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer mx-1 rounded-lg px-3 gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Unauthenticated: Sign In + Get Started */
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  search={{ auth: 'login' }}
                  className="hidden sm:flex items-center h-9 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white/80 hover:text-white transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/"
                  search={{ auth: 'signup' }}
                  className="contained-button h-9 px-5 text-sm font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </nav>
    </header>
  )
}
