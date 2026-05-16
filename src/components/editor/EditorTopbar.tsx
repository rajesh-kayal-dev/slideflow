import { Link, useNavigate } from '@tanstack/react-router'
import {
  Play,
  Share2,
  MoreHorizontal,
  ChevronDown,
  FileText,
  Download,
  ExternalLink,
  Zap,
  Crown,
  LogOut,
  User,
  Settings
} from 'lucide-react'
import { GenerationStatus } from '#/features/presentations/components/generation-status'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '#/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'

type EditorTopbarProps = {
  user: {
    id: string
    email: string
    name: string
    image?: string | null
  }
  title: string
  updatedLabel: string
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED'
  scrapeStatus?: string | null
  contentType?: string | null
  isGenerating: boolean
  isExporting: boolean
  hasSlides: boolean
  updatePending: boolean
  formValid: boolean
  regeneratePending: boolean
  deletePending: boolean
  onSave: () => void
  onRegenerate: () => void
  onExport: () => void
  onExportPdf: () => void
  onExportGoogleSlides: () => void
  onSlideshow: () => void
  onToggleSettings: () => void
  onUpgrade: () => void
  onShare: () => void
  showSettings: boolean
}

export function EditorTopbar({
  user,
  title,
  updatedLabel,
  status,
  scrapeStatus,
  contentType,
  isGenerating,
  isExporting,
  hasSlides,
  updatePending,
  formValid,
  regeneratePending,
  deletePending,
  onSave,
  onRegenerate,
  onExport,
  onExportPdf,
  onExportGoogleSlides,
  onSlideshow,
  onToggleSettings,
  onUpgrade,
  onShare,
  showSettings,
}: EditorTopbarProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/' })
          toast.success('Logged out successfully')
        }
      }
    })
  }

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl px-4 gap-4 z-50">
      {/* Left: Logo + Back + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/workspace"
          className="flex items-center justify-center size-8 bg-white/5 hover:bg-white/10 rounded-lg transition-all hover:scale-105 active:scale-95 group overflow-hidden border border-white/5"
        >
          <img src="/SlideFlowLogo.png" alt="SlideFlow" className="size-6 object-contain" />
        </Link>

        <div className="flex items-center gap-2 group cursor-pointer" onClick={onToggleSettings}>
           <h1 className="text-sm font-bold text-white/90 truncate max-w-[160px] sm:max-w-xs group-hover:text-white transition-colors">
             {title}
           </h1>
           <ChevronDown className={`size-3 text-white/40 group-hover:text-white transition-all ${showSettings ? 'rotate-180' : ''}`} />
        </div>

        <GenerationStatus
          status={status}
          scrapeStatus={scrapeStatus}
          contentType={contentType}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Present Button */}
        <div className="flex items-center h-8 bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 group transition-all overflow-hidden">
           <button 
             onClick={onSlideshow}
             className="flex items-center gap-2 px-3 h-full text-white text-xs font-black"
           >
             <Play className="size-3 fill-white" />
             Present
           </button>
        </div>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center size-8 rounded-lg text-secondaryText hover:text-white hover:bg-white/5 transition-all">
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-bgDark1 border-white/10 rounded-xl shadow-2xl p-1.5">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-white/40 px-2 py-1.5">Actions</DropdownMenuLabel>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-2 rounded-lg text-secondaryText hover:text-white focus:bg-white/5">
                <Download className="size-4" />
                <span className="text-xs font-medium">Export</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-bgDark1 border-white/10 rounded-xl p-1.5">
                <DropdownMenuItem onClick={onExport} className="flex items-center gap-2 px-2 py-2 rounded-lg text-secondaryText hover:text-white focus:bg-white/5 cursor-pointer">
                  <FileText className="size-4" />
                  <span className="text-xs font-medium">PowerPoint (.pptx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onExportPdf} 
                  disabled={isExporting}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-secondaryText hover:text-white focus:bg-white/5 cursor-pointer"
                >
                  <FileText className="size-4" />
                  <span className="text-xs font-medium">PDF Document</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem 
              onClick={onShare}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-secondaryText hover:text-white focus:bg-white/5 cursor-pointer"
            >
              <Share2 className="size-4" />
              <span className="text-xs font-medium">Share Presentation</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/5 my-1" />

            <DropdownMenuItem 
              onClick={onExportGoogleSlides}
              disabled={isExporting}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-secondaryText hover:text-white focus:bg-white/5 cursor-pointer"
            >
              <Zap className="size-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium">Open in Google Slides</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/5 my-1" />

            <DropdownMenuItem 
              onClick={onUpgrade}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-indigo-400 hover:text-indigo-300 focus:bg-indigo-400/5 cursor-pointer"
            >
              <Crown className="size-4 fill-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-tight">Upgrade Pro</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 outline-none group">
              <Avatar className="size-8 rounded-lg border border-white/10 group-hover:border-white/30 transition-all shadow-xl">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white text-[10px] font-black">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-bgDark1 border-white/10 rounded-xl shadow-2xl p-1.5">
            <div className="px-3 py-3 border-b border-white/5 mb-1.5">
               <p className="text-sm font-bold text-white truncate">{user.name}</p>
               <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
            
            <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 rounded-lg text-secondaryText hover:text-white focus:bg-white/5 cursor-pointer">
              <User className="size-4" />
              <span className="text-xs font-medium">Profile Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 rounded-lg text-secondaryText hover:text-white focus:bg-white/5 cursor-pointer">
              <Settings className="size-4" />
              <span className="text-xs font-medium">Workspace Config</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/5 my-1" />

            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-red-400 hover:text-red-300 focus:bg-red-400/5 cursor-pointer"
            >
              <LogOut className="size-4" />
              <span className="text-xs font-medium">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
