'use client'
import { useEffect, useRef } from 'react'
import { formatWithBranding } from '#/lib/utils'

// ── Data ─────────────────────────────────────────────────────────────────────
const row1 = [
  {
    name: 'Priya Anand',
    title: 'Head of Marketing at Zeta',
    content: 'I created a 12-slide investor deck in under 2 minutes. My co-founder thought I hired a designer overnight.',
    initials: 'PA',
    rating: 5,
  },
  {
    name: 'James Thornton',
    title: 'PM at NexaFlow',
    content: 'We use SlideFlow for every weekly sync. Just paste the Notion doc URL and our update is ready before the meeting starts.',
    initials: 'JT',
    rating: 5,
  },
  {
    name: 'Sarah Chen',
    title: 'CTO at Moonrise',
    content: 'URL scraping is witchcraft. I pasted a 5,000-word research paper and got a clean 10-slide summary in 30 seconds.',
    initials: 'SC',
    rating: 5,
  },
  {
    name: 'Mark Rodriguez',
    title: 'Head of Product at Vortex',
    content: 'The AI editing panel is what sells it. Ask it to "make this more persuasive" and it actually does. No hallucinations, just clean copy.',
    initials: 'MR',
    rating: 5,
  },
  {
    name: 'David Park',
    title: 'CEO at NovaTech',
    content: 'We cut our client onboarding deck time by 80%. SlideFlow is now non-negotiable in our sales workflow.',
    initials: 'DP',
    rating: 5,
  },
]

const row2 = [
  {
    name: 'Olivia Grant',
    title: 'Data Lead at Helix',
    content: 'Finally a dark-mode-first presentation tool. The slides look premium out of the box — no template fiddling required.',
    initials: 'OG',
    rating: 5,
  },
  {
    name: 'Elena Vasquez',
    title: 'Lead Engineer at Prism',
    content: 'Non-technical team members were building their own decks the first week. That never happens with complex tools.',
    initials: 'EV',
    rating: 5,
  },
  {
    name: 'Amara Osei',
    title: 'VP Engineering at Arcline',
    content: 'I use SlideFlow to summarise technical specs for exec reviews. It strips the jargon and keeps the substance. Genuinely impressive.',
    initials: 'AO',
    rating: 5,
  },
  {
    name: 'Ryan Mitchell',
    title: 'CTO at Streamline',
    content: 'The .pptx export is pixel-perfect. We submit to clients directly — zero post-processing needed.',
    initials: 'RM',
    rating: 5,
  },
  {
    name: 'Sofia Kim',
    title: 'Head of Growth at Prism',
    content: "I've evaluated a dozen AI slide tools. SlideFlow is the only one where the output doesn't embarrass you in a boardroom.",
    initials: 'SK',
    rating: 5,
  },
]

// ── Star row ──────────────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="mb-4 flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24" aria-hidden>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  )
}

// ── Single card ───────────────────────────────────────────────────────────────
type Testimonial = { name: string; title: string; content: string; initials: string; rating: number }

function TestimonialCard({ t, ariaHidden }: { t: Testimonial; ariaHidden?: boolean }) {
  return (
    <div
      className="card flex w-[340px] shrink-0 flex-col rounded-[1.25rem] p-6 transition-colors duration-500"
      aria-hidden={ariaHidden}
    >
      <Stars count={t.rating} />
      <p className="mb-6 flex-1 text-[0.95rem] leading-relaxed text-primaryText">"{formatWithBranding(t.content)}"</p>
      <div className="mt-auto flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primaryColor/20 text-xs font-bold text-primaryColor ring-1 ring-mainBorderDarker">
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-primaryText">{t.name}</div>
          <div className="text-xs text-secondaryText">{t.title}</div>
        </div>
      </div>
    </div>
  )
}

// ── Marquee row ───────────────────────────────────────────────────────────────
function MarqueeRow({ items, direction }: { items: Testimonial[]; direction: 'left' | 'right' }) {
  const doubled = [...items, ...items]
  return (
    <div className="relative w-full overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bgDark2 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bgDark2 to-transparent" />
      <div
        className={`flex gap-6 w-max ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        } hover:[animation-play-state:paused]`}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} ariaHidden={i >= items.length} />
        ))}
      </div>
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="bg-bgDark2 w-full overflow-hidden py-16 lg:py-24">
      <div className="sf-fade-in is-visible">
        <div className="mb-4 text-center">
          <span className="block-subtitle">Testimonials</span>
        </div>
        <h2 className="block-big-title mb-16 px-8 text-center sm:px-24">
          Loved by thousands of users
        </h2>

        <div className="flex flex-col gap-6">
          <MarqueeRow items={row1} direction="left" />
          <MarqueeRow items={row2} direction="right" />
        </div>
      </div>
    </section>
  )
}
