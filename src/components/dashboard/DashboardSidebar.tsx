import { Link, useRouterState, useRouteContext, useRouter } from '@tanstack/react-router'
import {
  LayoutDashboard,
  PlusCircle,
  LayoutTemplate,
  Settings,
  Zap,
  Pin,
  MoreHorizontal,
  ChevronDown,
  Presentation as PresentationIcon,
  Trash,
  UserPlus,
  Sparkles,
  Globe,
  FileUp,
  Check,
  Pencil,
  Trash2,
  Key,
  CircleHelp
} from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { presentationQueryKeys } from '#/features/presentations'
import { listPresentations } from '#/features/presentations/api/presentation-queries'
import {
  toggleFavorite,
  updatePresentation,
  deletePresentation
} from '#/features/presentations/actions/presentation-mutations'
import { workspaceQueryKeys, fetchMyWorkspace } from '#/features/workspaces/api/workspace-queries'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import { InviteModal } from './InviteModal'
import { PricingModal } from './PricingModal'
import { HelpSupportModal } from './HelpSupportModal'
import { ApiKeyModal } from './ApiKeyModal'
import { PresentationBuilder } from './PresentationBuilder'
import { X } from 'lucide-react'
import { toast } from 'sonner'

export function DashboardSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  const { data: presentations = [], isError, error } = useQuery({
    queryKey: presentationQueryKeys.list(),
    queryFn: () => listPresentations(),
  })

  // Mutations
  const toggleFavMut = useMutation({
    mutationFn: (id: string) => toggleFavorite({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() }),
    onError: (e) => toast.error(e.message)
  })

  const renameMut = useMutation({
    mutationFn: ({ id, title }: { id: string, title: string }) => updatePresentation({ data: { id, title } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() }),
    onError: (e) => toast.error(e.message)
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deletePresentation({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.trash() })
      toast.success('Moved to trash')
    },
    onError: (e) => toast.error(e.message)
  })

  const handleRename = (id: string, currentTitle: string) => {
    const newTitle = window.prompt('Enter new title:', currentTitle)
    if (newTitle && newTitle !== currentTitle) {
      renameMut.mutate({ id, title: newTitle })
    }
  }

  const { data: workspace } = useQuery({
    queryKey: workspaceQueryKeys.myWorkspace(),
    queryFn: () => fetchMyWorkspace(),
  })

  const { user } = useRouteContext({ strict: false }) as { user: any }

  const displayName = workspace?.name || (user?.name ? `${user.name}'s Workspace` : 'Personal Workspace')
  const displayInitials = displayName.substring(0, 2).toUpperCase()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-mainBorderDarker bg-bgDark1/80 backdrop-blur-xl">
        <div className="flex-1" />
      </aside>
    )
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-mainBorderDarker bg-bgDark1/80 backdrop-blur-xl">
      {/* Workspace Selector */}
      <div className="px-4 py-4 border-b border-mainBorderDarker bg-bgDark1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between hover:bg-bgDark2/50 p-1.5 rounded-lg transition-colors group outline-none">
              <div className="flex items-center gap-2 overflow-hidden">
                {workspace?.logoUrl ? (
                  <img src={workspace.logoUrl} alt="Logo" className="h-7 w-7 rounded-md object-cover shrink-0 border border-white/20" />
                ) : (
                  <Link to="/workspace" className="shrink-0">
                    <img src="/SlideFlowLogo.png" alt="SlideFlow" className="h-7 w-7 rounded-md object-contain bg-white/5 shrink-0 border border-white/10 p-0.5 hover:bg-white/10 transition-colors" />
                  </Link>
                )}
                <div className="flex flex-col items-start truncate">
                  <span className="font-['Inter'] text-sm font-semibold text-white truncate max-w-[140px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-secondaryText uppercase tracking-wider font-semibold">Free</span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-secondaryText group-hover:text-white transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 ml-2 bg-bgDark2 border-white/10 text-white" align="start" sideOffset={10}>
            <DropdownMenuLabel className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-white/10 bg-white/5">
                    <img src="/SlideFlowLogo.png" alt="SlideFlow" className="h-full w-full object-contain p-0.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate max-w-[120px]">{displayName}</span>
                    <span className="text-[10px] text-secondaryText">Free · 1 member</span>
                  </div>
                </div>
                <Link to="/settings">
                  <button className="text-[10px] font-bold border border-white/10 rounded-full px-3 py-1 hover:bg-white/5 transition-colors">
                    Settings
                  </button>
                </Link>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-secondaryText hover:text-white transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span className="text-sm font-medium">Invite teammates</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsPricingModalOpen(true)}
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-secondaryText hover:text-white transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Plans and pricing</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Upgrade Button */}
        <button
          onClick={() => setIsPricingModalOpen(true)}
          className="mt-3 flex items-center justify-center gap-2 w-full rounded-full border border-primaryColor/30 text-primaryColor hover:bg-primaryColor/10 py-1.5 text-xs font-semibold transition-all shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.1)]"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Upgrade for more AI
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="py-4 px-3 space-y-1">
        <button
          onClick={() => setIsBuilderOpen(true)}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold bg-[#4F46E5] text-white hover:bg-[#4F46E5]/90 transition-all shadow-lg shadow-[#4F46E5]/20 mb-4 transform hover:-translate-y-0.5 active:scale-95 group"
        >
          <div className="h-5 w-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          Create
        </button>

        <Link to="/workspace" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/workspace' || pathname === '/' ? 'bg-bgDark2 text-white' : 'text-secondaryText hover:text-white hover:bg-bgDark2/50'}`}>
          <LayoutDashboard className={`h-4.5 w-4.5 ${pathname === '/workspace' ? 'text-white' : ''}`} />
          Home
        </Link>
        <Link to="/web" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/web' ? 'bg-bgDark2 text-white' : 'text-secondaryText hover:text-white hover:bg-bgDark2/50'}`}>
          <Globe className={`h-4.5 w-4.5 ${pathname === '/web' ? 'text-white' : ''}`} />
          Web
        </Link>
        <Link to="/import" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/import' ? 'bg-bgDark2 text-white' : 'text-secondaryText hover:text-white hover:bg-bgDark2/50'}`}>
          <FileUp className="h-4.5 w-4.5" />
          Import
        </Link>
        <Link to="/templates" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === '/templates' ? 'bg-bgDark2 text-white' : 'text-secondaryText hover:text-white hover:bg-bgDark2/50'}`}>
          <LayoutTemplate className="h-4.5 w-4.5" />
          Templates
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondaryText hover:text-white hover:bg-bgDark2/50 transition-colors outline-none">
              <MoreHorizontal className="h-4.5 w-4.5" />
              More
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-bgDark2 border-white/10 text-white ml-2" align="start" sideOffset={10}>
            <Link to="/settings">
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-secondaryText hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/trash">
              <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-secondaryText hover:text-white transition-colors">
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">Trash</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => setIsPricingModalOpen(true)}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-secondaryText hover:text-white transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Upgrade</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={() => setIsApiKeyModalOpen(true)}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-secondaryText hover:text-white transition-colors"
            >
              <Key className="h-4 w-4" />
              <span className="text-sm font-medium">API Keys</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsHelpModalOpen(true)}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 text-secondaryText hover:text-white transition-colors"
            >
              <CircleHelp className="h-4 w-4" />
              <span className="text-sm font-medium">Help & Support</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <div className="px-6 py-2">
        <div className="h-px w-full bg-mainBorderDarker"></div>
      </div>

      {/* Recent Work Section */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
        <div className="mt-6 mb-2 px-3 flex items-center justify-between text-[0.65rem] font-bold text-secondaryText uppercase tracking-[0.2em] group">
          <div className="flex items-center gap-1.5">
            RECENT WORK
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white">
            <PlusCircle className="size-3.5" />
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {/* Grouping Logic for AI style history */}
          {(() => {
            const groups: Record<string, typeof presentations> = {
              'Pinned': [],
              'Today': [],
              'Yesterday': [],
              'Previous 7 Days': [],
              'Previous 30 Days': [],
              'Older': []
            }

            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            const sevenDaysAgo = new Date(today)
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            const thirtyDaysAgo = new Date(today)
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            presentations.forEach(p => {
              if (p.isFavorite) {
                groups['Pinned'].push(p)
                return
              }
              const date = new Date(p.updatedAt)
              if (date >= today) groups['Today'].push(p)
              else if (date >= yesterday) groups['Yesterday'].push(p)
              else if (date >= sevenDaysAgo) groups['Previous 7 Days'].push(p)
              else if (date >= thirtyDaysAgo) groups['Previous 30 Days'].push(p)
              else groups['Older'].push(p)
            })

            return Object.entries(groups).map(([label, items]) => {
              if (items.length === 0) return null
              return (
                <div key={label} className="space-y-1">
                  <div className="px-3 py-2 text-[10px] font-bold text-secondaryText/40 uppercase tracking-widest">{label}</div>
                  {items.map(p => {
                    const isActive = pathname.includes(p.id)
                    return (
                      <div key={p.id} className="group/item relative">
                        <Link
                          to="/presentations/$presentationId"
                          params={{ presentationId: p.id }}
                          className={`flex flex-col gap-0.5 rounded-xl px-3 py-2.5 text-sm transition-all relative ${isActive
                              ? 'bg-[#4F46E5]/10 border border-[#4F46E5]/20 ring-1 ring-[#4F46E5]/10'
                              : 'text-secondaryText hover:text-white hover:bg-white/[0.03] border border-transparent'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              {p.thumbnailUrl ? (
                                <img
                                  src={p.thumbnailUrl.startsWith('http') ? p.thumbnailUrl : `https://rajesh-rag-storage-160489847268-ap-south-1-an.s3.ap-south-1.amazonaws.com/${p.thumbnailUrl}`}
                                  alt=""
                                  className="h-5 w-5 rounded object-cover border border-white/10 shrink-0"
                                />
                              ) : (
                                <PresentationIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#4F46E5]' : 'text-secondaryText group-hover/item:text-white'}`} />
                              )}
                              <span className={`font-bold truncate ${isActive ? 'text-white' : 'group-hover/item:text-white transition-colors'}`}>
                                {p.title || 'Untitled Presentation'}
                              </span>
                            </div>
                            {isActive && (
                              <div className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                <Check className="h-2.5 w-2.5 text-green-500" />
                              </div>
                            )}
                            {p.isFavorite && !isActive && <Pin className="h-3 w-3 text-indigo-500 fill-indigo-500/20" />}
                          </div>
                          <div className="flex justify-end mt-1">
                            <span className="text-[10px] text-secondaryText font-medium opacity-60">
                              {new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(p.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </Link>

                        {/* Quick Actions Menu */}
                        <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'
                          }`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-secondaryText hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-0 w-fit p-1 bg-bgDark2 border-white/10 text-white flex flex-col gap-1" align="end">
                              <DropdownMenuItem
                                onClick={() => toggleFavMut.mutate(p.id)}
                                title={p.isFavorite ? "Unpin" : "Pin to top"}
                                className="flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-white/5 focus:bg-white/5 p-0"
                              >
                                <Pin className={`h-3.5 w-3.5 ${p.isFavorite ? 'text-indigo-500 fill-indigo-500/20' : 'text-secondaryText'}`} />
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRename(p.id, p.title)}
                                title="Rename"
                                className="flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-white/5 focus:bg-white/5 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5 text-secondaryText" />
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteMut.mutate(p.id)}
                                title="Delete"
                                className="flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })
          })()}
        </div>
      </div>

      {createPortal(
        <>
          {/* Invite Modal */}
          <InviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            workspaceName={displayName}
          />

          {/* Pricing Modal */}
          <PricingModal
            isOpen={isPricingModalOpen}
            onClose={() => setIsPricingModalOpen(false)}
          />

          {/* Help & Support Modal */}
          <HelpSupportModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
          />

          {/* API Key Modal */}
          <ApiKeyModal
            isOpen={isApiKeyModalOpen}
            onClose={() => setIsApiKeyModalOpen(false)}
          />

          {/* Create with AI Modal */}
          {isBuilderOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto relative custom-scrollbar bg-bgDark1 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <button
                  onClick={() => setIsBuilderOpen(false)}
                  className="absolute top-6 right-6 p-3 text-secondaryText hover:text-white hover:bg-white/10 rounded-full transition-colors z-[10000]"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="py-12">
                  <PresentationBuilder />
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </aside>
  )
}
