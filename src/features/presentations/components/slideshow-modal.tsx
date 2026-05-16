import { Button } from '#/components/ui/button'
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ModularSlide } from '#/features/templates/blocks/ModularSlide'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectFade, Keyboard, Autoplay, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

type Slide = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
  layoutType?: any
}

type SlideshowModalProps = {
  slides: Slide[]
  initialIndex?: number
  onClose: () => void
  template?: any
}

export function SlideshowModal({
  slides,
  initialIndex = 0,
  onClose,
  template,
}: SlideshowModalProps) {
  const swiperRef = useRef<SwiperType | null>(null)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const currentSlide = slides[currentIndex]

  const toggleAutoplay = useCallback(() => {
    if (!swiperRef.current) return
    if (isPlaying) {
      swiperRef.current.autoplay.stop()
    } else {
      swiperRef.current.autoplay.start()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'p' || e.key === ' ') {
        e.preventDefault()
        toggleAutoplay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, toggleAutoplay])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-700">
      <Swiper
        modules={[Keyboard, Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        keyboard={{ enabled: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        initialSlide={initialIndex}
        speed={1000}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          swiper.autoplay.stop()
        }}
        onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
        onReachEnd={() => {
          if (isPlaying) {
            setTimeout(() => {
              onClose()
            }, 5000) // Wait for the last slide's duration before closing
          }
        }}
        onAutoplayStart={() => setIsPlaying(true)}
        onAutoplayStop={() => setIsPlaying(false)}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className="w-full h-full bg-black cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const width = rect.width
                
                if (x < width * 0.3) {
                  swiperRef.current?.slidePrev()
                } else if (x > width * 0.7) {
                  if (currentIndex >= slides.length - 1) {
                    onClose()
                  } else {
                    swiperRef.current?.slideNext()
                  }
                } else {
                  toggleAutoplay()
                }
              }}
            >
               <ModularSlide 
                 slide={slide as any} 
                 config={template?.config} 
                 isFullscreen={true} 
               />

              {slide.notes && showControls && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 max-w-2xl px-6 py-3 bg-black/60 backdrop-blur-md rounded-xl z-50 border border-white/10">
                  <p className="text-white/70 text-sm text-center">
                    <span className="font-bold text-indigo-400">Notes:</span>{' '}
                    {slide.notes}
                  </p>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className={`absolute bottom-0 left-0 right-0 p-6 z-30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full size-12"
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="size-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full size-12"
            onClick={toggleAutoplay}
          >
            {isPlaying ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full size-12"
            onClick={() => {
              if (currentIndex >= slides.length - 1) {
                onClose()
              } else {
                swiperRef.current?.slideNext()
              }
            }}
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>

        <div className="text-center mt-4">
          <span className="text-white/60 text-sm">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-4 right-4 z-30 text-white hover:bg-white/20 rounded-full size-12 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <X className="size-6" />
      </Button>
    </div>
  )
}
