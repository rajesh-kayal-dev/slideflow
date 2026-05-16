import { useRef, useEffect } from 'react'
import { PlusCircle, RefreshCw, Plus, Layout, Type, MoreVertical, Trash2, Edit2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { SlidePreview } from '#/features/presentations/components/slide-preview'

type Slide = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
  layoutType?: any
}

type SlidePreviewListProps = {
  slides: Slide[]
  activeIndex: number
  isGenerating: boolean
  isImported?: boolean
  onSelect: (index: number) => void
  onRegenerate: () => void
  onCreate: () => void
  onDelete: (id: string) => void
  onRename: (id: string) => void
  regeneratePending: boolean
  template?: any
}

export function SlidePreviewList({
  slides,
  activeIndex,
  isGenerating,
  isImported,
  onSelect,
  onRegenerate,
  onCreate,
  onDelete,
  onRename,
  regeneratePending,
  template,
}: SlidePreviewListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to active slide in sidebar
  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [activeIndex])
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md">
      {/* Sidebar Header with Tools */}
      <div className="flex h-12 items-center gap-1 px-3 border-b border-white/5">
        <button 
          onClick={onCreate}
          className="flex-1 flex items-center justify-center gap-2 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors group"
        >
           <Plus className="size-3 group-hover:rotate-90 transition-transform" />
           New
        </button>
        <button className="flex items-center justify-center size-8 rounded-lg text-secondaryText hover:text-white hover:bg-white/5 transition-colors">
           <Layout className="size-4" />
        </button>
        <button className="flex items-center justify-center size-8 rounded-lg text-secondaryText hover:text-white hover:bg-white/5 transition-colors">
           <PlusCircle className="size-4" />
        </button>
      </div>

      {/* Slide list */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-4"
      >
        {slides.map((slide, i) => (
          <div 
            key={slide.id} 
            onClick={() => onSelect(i)}
            className="relative group cursor-pointer"
          >
            {/* Slide number pill overlay */}
            <div className={`absolute top-2 left-2 z-20 flex h-5 w-5 items-center justify-center rounded bg-black/60 backdrop-blur-md border text-[10px] font-black transition-all ${
               i === activeIndex ? 'border-indigo-500/50 text-indigo-400' : 'border-white/10 text-secondaryText'
            }`}>
              {i + 1}
            </div>
            <div
              className={`relative aspect-[16/10] rounded-lg overflow-hidden transition-all duration-300 ${
                i === activeIndex
                  ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'ring-1 ring-white/10 hover:ring-white/30 grayscale-[50%] hover:grayscale-0'
              }`}
            >
               {/* High-fidelity Thumbnail using SlidePreview scaled down */}
               <div className="absolute inset-0 origin-top-left scale-[0.25] w-[400%] h-[400%] pointer-events-none select-none">
                  <SlidePreview 
                    slide={slide as any} 
                    template={template} 
                    isFullscreen={false} 
                  />
               </div>
               
               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
               <div className="absolute bottom-2 left-2 right-2 truncate">
                  <span className="text-[10px] font-bold text-white shadow-sm">{slide.title}</span>
               </div>
            </div>

            {/* Hover Options Menu */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <button 
                       onClick={(e) => e.stopPropagation()}
                       className="p-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-colors"
                     >
                        <MoreVertical className="size-3" />
                     </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-bgDark1 border-white/10 w-fit min-w-0 p-0.5 rounded-xl shadow-2xl backdrop-blur-xl flex flex-col items-center">
                     <DropdownMenuItem 
                       onClick={(e) => {
                         e.stopPropagation();
                         onRename(slide.id);
                       }}
                       className="flex items-center justify-center size-7 rounded-lg focus:bg-white/5 text-secondaryText focus:text-white cursor-pointer mb-0.5"
                       title="Rename"
                     >
                        <Edit2 className="size-3" />
                     </DropdownMenuItem>
                     <DropdownMenuItem 
                       onClick={(e) => {
                         e.stopPropagation();
                         onDelete(slide.id);
                       }}
                       className="flex items-center justify-center size-7 rounded-lg focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer"
                       title="Delete"
                     >
                        <Trash2 className="size-3" />
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-8 bg-white/5 animate-pulse">
            <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin" />
            <span className="text-[10px] text-secondaryText font-bold uppercase tracking-widest">Drafting...</span>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-white/5 bg-black/20">
         <div className="flex items-center justify-between text-[10px] text-secondaryText font-bold uppercase tracking-widest">
            <span>{slides.length} slides</span>
            <span>v1.2</span>
         </div>
      </div>
    </aside>
  )
}
