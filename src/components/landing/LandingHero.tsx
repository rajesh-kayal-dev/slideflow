import React from 'react'
import { Sparkles, ChevronDown, Wand2 } from 'lucide-react'
import { BrandName } from '#/components/BrandName'
import { toast } from 'sonner'
import { SLIDE_STYLES, TONE_OPTIONS, LAYOUT_OPTIONS } from '#/features/presentations'
import { enhancePublicPrompt } from '#/features/presentations/actions/presentation-mutations'

import { VideoModal } from './VideoModal'

export function LandingHero({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const [prompt, setPrompt] = React.useState('')
  const [slideCount, setSlideCount] = React.useState(8)
  const [style, setStyle] = React.useState('minimal')
  const [tone, setTone] = React.useState('formal')
  const [layout, setLayout] = React.useState('balanced')
  const [isEnhancing, setIsEnhancing] = React.useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false)

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a topic first')
      return
    }

    try {
      setIsEnhancing(true)
      const { enhancedPrompt } = await enhancePublicPrompt({
        data: { prompt: prompt.trim(), slideCount, style, tone, layout }
      })
      setPrompt(enhancedPrompt)
      toast.success('Prompt enhanced!')
    } catch (error) {
      toast.error('Failed to enhance prompt')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleCreateClick = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a topic for your presentation')
      return
    }

    // Store the prompt and settings in session storage to use after login
    sessionStorage.setItem('pending_presentation', JSON.stringify({
      prompt,
      slideCount,
      style,
      tone,
      layout,
      timestamp: Date.now()
    }))

    // Open auth modal
    onOpenAuth?.()
  }

  return (
    <section
      className="mb-0 flex w-full items-center justify-center pb-8 sm:pb-16 md:mb-0 md:pb-20 lg:mb-0 lg:pb-0 xl:mb-0 2xl:mb-0"
      id="home"
    >
      <div className="flex w-11/12 xl:w-10/12 mx-auto flex-col items-center justify-center pt-16 text-center md:pt-16 lg:pt-20">
        <div className="hero-fade-in" style={{ '--delay': '0s' } as React.CSSProperties}>
          <span className="block-subtitle mt-16 mb-6 block text-[0.65rem] sm:mt-32 sm:text-xs">
            Experience the Future of Presentations
          </span>
        </div>
        <div className="hero-fade-in mx-auto max-w-3xl px-4" style={{ '--delay': '0.05s' } as React.CSSProperties}>
          <h1 className="xs:text-4xl text-[1.7rem] leading-[1.1] font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="text-heroText">Build beautiful presentations with AI</span><br />
          </h1>
        </div>
        <div className="hero-fade-in" style={{ '--delay': '0.1s' } as React.CSSProperties}>
          <p className="text-secondaryText mx-auto mt-7 max-w-2xl px-4 text-sm leading-relaxed sm:text-base">
            <BrandName /> helps you generate premium, highly-engaging presentations instantly.
            No more starting from blank slides.
          </p>
        </div>
        <div className="hero-fade-in" style={{ '--delay': '0.15s' } as React.CSSProperties}>
          <div className="mt-10 mb-24 flex flex-col justify-center gap-2 sm:mb-40 sm:flex-row">
            <button
              onClick={onOpenAuth}
              className="contained-button mr-0 mb-2 h-12 w-72 text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] sm:mr-2 sm:mb-0 sm:w-44 lg:mr-3"
            >
              Get Started
            </button>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="text-primaryText bg-bgDark2 hover:bg-bgDark3 border-primaryColor flex h-12 w-72 cursor-pointer items-center justify-center rounded-xl border border-solid text-sm font-bold transition sm:w-44"
            >
              Live demo
            </button>
          </div>
        </div>

        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoId="ZpXN9M0WLQ4"
        />

        {/* Prompt Box UI Overlay */}
        <div className="relative z-20 flex w-screen justify-center px-4">
          <div
            className="hero-fade-in image-glow-border z-10 mx-auto w-full max-w-4xl rounded-2xl bg-[#111827]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl"
            style={{ '--delay': '0.15s' } as React.CSSProperties}
          >
            <div className="space-y-6">
              {/* Textarea Area */}
              <div className="relative group/textarea">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your presentation topic, e.g., 'A pitch deck for a new sustainable fashion brand'..."
                  className="w-full h-40 md:h-48 p-5 pr-12 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !prompt.trim()}
                  className="absolute bottom-4 right-4 p-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/enhance"
                >
                  {isEnhancing ? (
                    <Sparkles className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4 group-hover/enhance:scale-125 transition-transform" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isEnhancing ? 'Enhancing...' : 'Enhance'}
                  </span>
                </button>
              </div>

              {/* Controls Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2 bg-[#030712]/50 p-4 rounded-xl border border-white/5 text-left">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-widest">
                    Slides: {slideCount}
                  </label>
                  <input
                    type="range"
                    min="3" max="20"
                    value={slideCount}
                    onChange={(e) => setSlideCount(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-1 mt-2"
                  />
                </div>

                {[
                  { key: 'style', label: 'Style', options: SLIDE_STYLES, value: style, setter: setStyle },
                  { key: 'tone', label: 'Tone', options: TONE_OPTIONS, value: tone, setter: setTone },
                  { key: 'layout', label: 'Layout', options: LAYOUT_OPTIONS, value: layout, setter: setLayout },
                ].map((opt) => (
                  <div key={opt.label} className="space-y-2 bg-[#030712]/50 p-3 rounded-xl border border-white/5 text-left">
                    <label className="text-[10px] font-bold text-secondaryText uppercase tracking-widest">
                      {opt.label}
                    </label>
                    <select
                      value={opt.value}
                      onChange={(e) => opt.setter(e.target.value)}
                      className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                    >
                      {opt.options.map(o => (
                        <option key={o.value} value={o.value} className="bg-bgDark1">{o.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Action Area */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleCreateClick}
                  className="flex items-center gap-2 bg-[#4F46E5] hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 group"
                >
                  <Wand2 className="size-5 group-hover:rotate-12 transition-transform" />
                  Create Presentation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* The 'V' Shape Divider */}
        <div className="relative flex w-screen justify-center">
          <div className="shape-divider-bottom-1665343298 -mt-20 hidden sm:-mt-32 md:-mt-[12rem] lg:block">
            <svg
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="bg-bgDark2"
              aria-hidden="true"
            >
              <path
                d="M1200 0L0 0 598.97 114.72 1200 0z"
                className="shape-fill fill-background"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
