import { Search, LogOut, Sun, Moon, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { signOut } from '#/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { globalSearch } from '#/features/search/actions/search-actions'
import { FileText, LayoutTemplate, History, Sparkles, Loader2, X } from 'lucide-react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function DashboardHeader() {
  const navigate = useNavigate()
  const { user } = useRouteContext({ strict: false }) as { user: any }
  const [theme, setTheme] = useState<Theme>('dark')
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['global-search', searchQuery],
    queryFn: () => globalSearch({ data: searchQuery }),
    enabled: searchQuery.length >= 2,
    staleTime: 1000 * 60, // Cache for 1 min
  })

  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')

    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-container')) {
        setShowResults(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate({ to: '/' })
      window.location.reload()
    } catch {
      toast.error('Could not sign out')
    }
  }

  const iconBtn = "flex h-8 w-8 items-center justify-center rounded-lg border border-mainBorderFaintest bg-bgDark2/80 text-secondaryText hover:text-primaryText hover:border-mainBorderSubtler transition-colors focus:outline-none focus:border-primaryColor"

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-mainBorderDarker bg-bgDark1/70 px-6 backdrop-blur-xl">

      {/* Left: breadcrumb */}
      <nav className="flex items-center gap-2 text-sm min-w-0">
        <Link to="/workspace" className="text-secondaryText hover:text-primaryText transition-colors font-medium shrink-0">
          Workspace
        </Link>
        <span className="text-mainBorderSubtler select-none shrink-0">/</span>
        <span className="text-primaryText font-semibold truncate">New Presentation</span>
      </nav>

      {/* Right: controls */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Search */}
        <div className="relative hidden lg:block search-container">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondaryText pointer-events-none" />
          <input
            type="text"
            placeholder="Search presentations & templates..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            className="h-8 w-64 rounded-lg border border-mainBorderFaintest bg-bgDark2/80 pl-8 pr-8 text-xs text-primaryText placeholder:text-secondaryText hover:border-mainBorderSubtler focus:border-primaryColor focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowResults(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondaryText hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 left-0 w-[400px] bg-bgDark1/95 border border-mainBorderDarker rounded-xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 text-[#4F46E5] animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Presentations Section */}
                    {searchResults?.presentations && searchResults.presentations.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-1.5 text-[10px] font-black text-secondaryText/50 uppercase tracking-widest flex items-center gap-2">
                          <History className="h-3 w-3" />
                          Your Presentations
                        </div>
                        {searchResults.presentations.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              navigate({ to: '/presentations/$presentationId', params: { presentationId: p.id } })
                              setShowResults(false)
                            }}
                            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 text-left group transition-all"
                          >
                            <div className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center text-secondaryText group-hover:text-white">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{p.title || 'Untitled'}</p>
                              <p className="text-[10px] text-secondaryText truncate">Edited {new Date(p.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Templates Section */}
                    {searchResults?.templates && searchResults.templates.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-black text-secondaryText/50 uppercase tracking-widest flex items-center gap-2">
                          <LayoutTemplate className="h-3 w-3" />
                          Templates
                        </div>
                        {searchResults.templates.map((t: any) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              navigate({ to: '/templates' }) // Or to specific template if implemented
                              setShowResults(false)
                            }}
                            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 text-left group transition-all"
                          >
                            <div className="h-8 w-8 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{t.name}</p>
                              <p className="text-[10px] text-secondaryText truncate">{t.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {(!searchResults?.presentations?.length && !searchResults?.templates?.length) && (
                      <div className="py-12 text-center">
                        <Search className="h-8 w-8 text-secondaryText/20 mx-auto mb-3" />
                        <p className="text-xs text-secondaryText font-medium">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className={iconBtn}
        >
          {theme === 'dark'
            ? <Sun className="h-3.5 w-3.5" />
            : <Moon className="h-3.5 w-3.5" />
          }
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="relative h-8 w-8 rounded-full border-2 border-primaryColor/40 hover:border-primaryColor/80 focus:outline-none focus:border-primaryColor transition-all"
            >
              <Avatar className="h-full w-full">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'User'} />
                <AvatarFallback className="bg-primaryColor/30 text-primaryColor text-xs font-bold rounded-full">
                  {user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : <User className="h-3.5 w-3.5" />
                  }
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-bgDark1 border border-mainBorderDarker shadow-2xl rounded-xl mt-1">
            <DropdownMenuLabel className="font-normal px-3 py-2.5">
              <p className="text-sm font-semibold text-primaryText truncate">
                {user?.name ?? 'User'}
              </p>
              <p className="text-xs text-secondaryText truncate mt-0.5">
                {user?.email ?? ''}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-mainBorderDarker" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer mx-1 rounded-lg px-3 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}
