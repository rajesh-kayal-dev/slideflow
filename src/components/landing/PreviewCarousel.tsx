import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  { image: '/images/previews/preview1.png', title: 'AI Editor' },
  { image: '/images/previews/preview2.png', title: 'Template Gallery' },
  { image: '/images/previews/preview3.png', title: 'Export Options' },
  { image: '/images/previews/preview4.png', title: 'Mobile Preview' },
  { image: '/images/features/feature1.png', title: 'Smart Generation' },
  { image: '/images/features/feature2.png', title: 'Dynamic Layouts' },
  { image: '/images/features/feature3.png', title: 'Data Analysis' },
  { image: '/images/features/feature4.png', title: 'Live Collab' },
]

export function PreviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [useAnimation, setUseAnimation] = useState(true)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const trackRef = useRef<HTMLDivElement>(null)

  const displaySlides = [...SLIDES, ...SLIDES, ...SLIDES]
  const realCount = SLIDES.length

  useEffect(() => {
    setCurrentIndex(realCount)

    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [realCount])

  const handlePrev = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setUseAnimation(true)
    setCurrentIndex((prev) => prev - 1)
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setUseAnimation(true)
    setCurrentIndex((prev) => prev + 1)
  }

  useEffect(() => {
    if (!isTransitioning) return
    const timer = setTimeout(() => {
      setIsTransitioning(false)
      if (currentIndex <= realCount - 1) {
        setUseAnimation(false)
        setCurrentIndex(currentIndex + realCount)
      }
      if (currentIndex >= realCount * 2) {
        setUseAnimation(false)
        setCurrentIndex(currentIndex - realCount)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [currentIndex, isTransitioning, realCount])

  const isMobile = windowWidth < 640
  const slideWidthPercent = isMobile ? 100 : 50
  const gapRem = 1.5 // 24px

  return (
    <section className="bg-bgDark2 w-full pt-8 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      <div className="animate-in fade-in duration-700">
        <div className="content-container">
          <div className="mb-12 max-w-2xl">
            <span className="block-subtitle mb-6 block">Features at a glance</span>
            <h2 className="block-big-title mb-6">Preview what's inside</h2>
            <p className="text-secondaryText">
              Swipe through key screens to see how each feature looks and feels in practice.
            </p>
          </div>

          <div role="region" aria-roledescription="carousel" className="relative group">
            <button
              onClick={handlePrev}
              className="absolute top-1/2 -left-4 lg:-left-12 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-mainBorder bg-bgDark3 text-primaryText transition-all duration-300 hover:bg-bgDark3Hover lg:flex shadow-2xl"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 -right-4 lg:-right-12 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-mainBorder bg-bgDark3 text-primaryText transition-all duration-300 hover:bg-bgDark3Hover lg:flex shadow-2xl"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex"
                style={{
                  gap: `${gapRem}rem`,
                  transition: useAnimation ? 'transform 500ms ease-out' : 'none',
                  transform: `translateX(calc(-${currentIndex * slideWidthPercent}% - ${currentIndex * gapRem}rem))`
                }}
              >
                {displaySlides.map((slide, idx) => (
                  <div
                    key={idx}
                    className="bg-bgDark1Lighter border-mainBorderDarker flex aspect-[4/3] w-full shrink-0 items-center justify-center rounded-xl border sm:w-[calc(50%-0.75rem)] overflow-hidden relative group/slide"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if images are somehow missing
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.classList.add('bg-bgDark3');
                      }}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover/slide:bg-black/40 transition-colors" />
                    <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 opacity-0 group-hover/slide:opacity-100 transition-opacity">
                      <p className="text-white font-bold text-sm">{slide.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              {SLIDES.map((_, i) => {
                const activeIndex = ((currentIndex % realCount) + realCount) % realCount;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setUseAnimation(true)
                      setCurrentIndex(i + realCount)
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-primaryText w-8' : 'bg-secondaryText/30 w-2.5'
                      }`}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
