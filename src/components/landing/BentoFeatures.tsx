import { Wand2, Globe, Sparkles, Layout, Zap, Download } from 'lucide-react'
import { BrandName } from '#/components/BrandName'

// ── Stat cards ──────────────────────────────────────────────────────────────
const STATS = [
  { value: '10K+', label: 'Presentations made' },
  { value: '98%', label: 'Satisfaction rate' },
  { value: '30s', label: 'Average generation time' },
  { value: '150+', label: 'Countries reached' },
]

// ── Bento items ──────────────────────────────────────────────────────────────
// Top-left: big card (col-span-2)
function BentoPromptCard() {
  return (
    <div className="card group relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl p-8 lg:col-span-2 sf-fade-in is-visible">
      {/* Background watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <Wand2 className="h-48 w-48" />
      </div>
      {/* Visual */}
      <div className="relative mb-8 flex flex-1 items-center justify-center">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primaryColor/20 bg-primaryColor/10">
            <Wand2 className="h-7 w-7 text-primaryColor" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-2 w-28 rounded-full bg-primaryColor/20" />
            <div className="h-2 w-20 rounded-full bg-primaryColor/10" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-xl font-bold text-primaryText">Prompt to presentation</h3>
        <p className="text-sm leading-relaxed text-secondaryText">
          Describe your topic, paste your notes, or share a URL. <BrandName />'s AI turns your words
          into a polished, structured presentation in under 30 seconds.
        </p>
      </div>
    </div>
  )
}

// Top-right: floating pills card (col-span-3)
function BentoModesCard() {
  const chips = [
    { label: 'Write Prompt', icon: Wand2 },
    { label: 'From URL', icon: Globe },
    { label: 'AI Editing', icon: Sparkles },
  ]
  const offsets = ['translate-x-4', '-translate-x-6', 'translate-x-2']
  return (
    <div className="card relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl p-8 lg:col-span-3">
      <div className="mb-8 flex flex-1 flex-col items-center justify-center gap-3">
        {chips.map(({ label, icon: Icon }, i) => (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-full border border-mainBorderDarker bg-bgDark3/80 px-5 py-2.5 ${offsets[i]}`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryColor/15">
              <Icon className="h-4 w-4 text-primaryColor" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondaryText">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-2 text-xl font-bold text-primaryText">Multiple creation modes</h3>
        <p className="text-sm leading-relaxed text-secondaryText">
          Whether you start from a prompt, paste article notes, or scrape a live URL — <BrandName />
          adapts to how you actually work.
        </p>
      </div>
    </div>
  )
}

// Bottom-left: export card (col-span-3)
function BentoExportCard() {
  const formats = [
    { label: '.pptx', color: '#D04B26', bg: '#D04B26' },
    { label: '.pdf', color: '#E63B2E', bg: '#E63B2E' },
    { label: 'Slides', color: '#4285F4', bg: '#4285F4' },
  ]
  return (
    <div className="card relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl p-8 lg:col-span-3">
      <div className="mb-8 flex flex-1 items-center justify-center gap-4">
        {formats.map(({ label, bg }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-mainBorderDarker bg-bgDark3/60 px-4 py-3"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-bold"
              style={{ background: `${bg}20` }}
            >
              <span style={{ color: bg }}>{label.charAt(1).toUpperCase()}</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-primaryText">{label}</div>
              <div className="text-[10px] text-secondaryText">Export</div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-2 text-xl font-bold text-primaryText">Export anywhere</h3>
        <p className="text-sm leading-relaxed text-secondaryText">
          Download as native .pptx, share as a link, or open directly in Google Slides. Your
          presentations work wherever your audience is.
        </p>
      </div>
    </div>
  )
}

// Bottom-right: AI glow card (col-span-2)
function BentoAICard() {
  return (
    <div className="card relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl p-8 lg:col-span-2">
      <div className="relative mb-8 flex flex-1 items-center justify-center">
        <div
          className="pointer-events-none absolute h-32 w-32 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
        />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-mainBorderDarker bg-bgDark3">
          <Sparkles className="h-9 w-9 text-primaryColor" />
        </div>
        <div className="absolute bottom-2 text-[10px] uppercase tracking-widest text-secondaryText/40">
          <BrandName className="text-[10px]" /> AI
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-xl font-bold text-primaryText">AI-powered editing</h3>
        <p className="text-sm leading-relaxed text-secondaryText">
          Chat with AI to refine any slide. Change tone, shorten content, swap layouts — all from
          a single prompt.
        </p>
      </div>
    </div>
  )
}

export function BentoFeatures() {
  return (
    <section className="bg-bgDark2 pt-8 pb-0 lg:pt-12 lg:pb-0" id="features">
      <div className="content-container">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center sf-fade-in is-visible">
          <span className="block-subtitle">Features</span>
          <h2 className="block-big-title mt-4">Unlike anything you've used before</h2>
          <p className="mt-6 text-base text-secondaryText leading-relaxed">
            <BrandName /> combines fast AI generation with a premium editor, so you stop starting from
            blank slides forever.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-mainBorderFaintest bg-bgDark1/40 p-6 text-center backdrop-blur-sm"
            >
              <div className="text-3xl font-extrabold text-primaryText tabular-nums">{value}</div>
              <div className="mt-1.5 text-xs text-secondaryText">{label}</div>
            </div>
          ))}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 sf-fade-in is-visible">
          <BentoPromptCard />
          <BentoModesCard />
          <BentoExportCard />
          <BentoAICard />
        </div>
      </div>
    </section>
  )
}
