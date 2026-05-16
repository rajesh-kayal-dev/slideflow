import { ChevronLeft, ChevronRight, Maximize, RefreshCw } from 'lucide-react'
import { SlidePreview } from '#/features/presentations/components/slide-preview'
import { SlideEditor } from './SlideEditor'
import { useRef, useEffect } from 'react'
import { LoadingScreen } from '#/components/ui/LoadingScreen'

type Slide = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
}

type SlideCanvasProps = {
  slides: Slide[]
  activeIndex: number
  activeSlide: Slide | undefined
  isGenerating: boolean
  isFullscreen: boolean
  contentType?: string | null
  scrapeStatus?: string | null
  template?: any
  isImported?: boolean
  onPrev: () => void
  onNext: () => void
  onFullscreen: () => void
  onRegenerate: () => void
  regeneratePending: boolean
  editingSlideId: string | null
  presentationId: string
  onSelect: (index: number) => void
}

export function SlideCanvas({
  slides,
  activeIndex,
  activeSlide,
  isGenerating,
  isFullscreen,
  contentType,
  scrapeStatus,
  template,
  isImported,
  onPrev,
  onNext,
  onFullscreen,
  onRegenerate,
  regeneratePending,
  editingSlideId,
  presentationId,
  onSelect,
}: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // 1. Click-to-select logic
  const handleSlideClick = (index: number) => {
    isScrollingRef.current = true
    onSelect(index)
    // Release the lock after a short delay so scroll observer can work again
    setTimeout(() => { isScrollingRef.current = false }, 1000)
  }

  // 2. Scroll-to-select logic using IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver((entries) => {
      if (isScrollingRef.current) return

      // Find the entry that is most visible
      const visible = entries.reduce((prev, curr) => {
        return (curr.intersectionRatio > prev.intersectionRatio) ? curr : prev
      })

      if (visible.isIntersecting && visible.intersectionRatio > 0.4) {
        const index = parseInt((visible.target as HTMLElement).dataset.index || '0')
        if (index !== activeIndex) {
          onSelect(index)
        }
      }
    }, {
      root: containerRef.current,
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0]
    })

    const children = Array.from(containerRef.current.children)
    children.forEach(child => observer.observe(child))

    return () => observer.disconnect()
  }, [activeIndex, onSelect, slides.length])

  // 3. Sync scroll when activeIndex changes from Sidebar (or on mount)
  useEffect(() => {
    if (containerRef.current && activeIndex >= 0) {
      const activeEl = containerRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        // Lock observer while we scroll programmatically to prevent "fighting"
        isScrollingRef.current = true
        
        activeEl.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center' 
        })

        // Release lock after scroll animation finishes
        const timer = setTimeout(() => {
          isScrollingRef.current = false
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [activeIndex])

  const generatingMessage =
    contentType === 'url' && scrapeStatus === 'scraping'
      ? 'Reading the webpage…'
      : contentType === 'url' && scrapeStatus === 'done'
        ? 'AI is crafting your slides…'
        : 'Generating your presentation…'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Main Canvas Scroll Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth snap-y snap-mandatory custom-scrollbar py-20 px-6 md:px-12 space-y-32 pb-80"
      >
        {slides.map((slide, i) => (
          <div 
            key={slide.id} 
            data-index={i}
            onClick={() => handleSlideClick(i)}
            className={`group relative transition-all duration-700 transform cursor-pointer snap-center snap-always ${
              i === activeIndex ? 'scale-100' : 'scale-[0.98] hover:scale-[0.99] opacity-50'
            }`}
          >
             <SlideEditor 
               slide={slide} 
               index={i} 
               isActive={i === activeIndex} 
               template={template}
               isImported={isImported}
               presentationId={presentationId}
               isAiEditing={slide.id === editingSlideId}
             />
          </div>
        ))}

        {/* Generating state */}
        {slides.length === 0 && isGenerating && (
          <LoadingScreen message={generatingMessage} fullScreen={false} />
        )}

        {/* Empty state */}
        {slides.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="bg-bgDark1/50 p-10 border border-white/5 rounded-3xl text-center max-w-sm w-full backdrop-blur-xl">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
                <RefreshCw className="h-6 w-6 text-secondaryText" />
              </div>
              <p className="text-white font-bold mb-2">
                {isImported ? 'No slides extracted' : 'No slides here yet'}
              </p>
              <p className="text-secondaryText text-sm mb-6 leading-relaxed">
                {isImported 
                  ? 'We could not find any slides in this document. It might be empty or in an unsupported format.'
                  : 'Click regenerate to build slides from your current content and settings.'}
              </p>
              {!isImported && (
                <button
                  onClick={onRegenerate}
                  disabled={regeneratePending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 w-full rounded-xl gap-2 text-sm font-bold shadow-lg shadow-indigo-600/10 transition-all"
                >
                  <RefreshCw className={`h-4 w-4 ${regeneratePending ? 'animate-spin' : ''}`} />
                  Generate Slides
                </button>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Navigation / Page Indicator (Floating) */}
      {slides.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl z-40">
          <button
            onClick={onPrev}
            disabled={activeIndex === 0}
            className="text-secondaryText hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
            Slide {activeIndex + 1} of {slides.length}
          </span>
          <button
            onClick={onNext}
            disabled={activeIndex >= slides.length - 1}
            className="text-secondaryText hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
