import { BrandName } from '#/components/BrandName'

export function CTASection({ onOpenAuth }: { onOpenAuth?: () => void }) {
  return (
    <section className="bg-bgDark1 py-24 sm:py-32" id="cta">
      <div className="mx-auto w-11/12 xl:w-10/12">
        <div className="relative overflow-hidden rounded-3xl border border-primaryColor/20 bg-primaryColor/5 px-8 py-16 text-center backdrop-blur-sm sm:px-16">
          {/* Glow orbs */}
          <div
            className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 right-1/4 h-40 w-40 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            <span className="block-subtitle mb-4 block">Get started today</span>
            <h2 className="block-big-title mx-auto max-w-2xl">
              Join 10,000+ teams who trust <BrandName plain />
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-secondaryText">
              Stop starting from blank slides. Generate your first AI presentation in under 30 seconds
              — no credit card required.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={onOpenAuth}
                className="contained-button h-12 w-full px-8 text-base font-bold sm:w-auto"
              >
                Start for free
              </button>
              <a
                href="#features"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-mainBorderDarker bg-bgDark2 px-8 text-sm font-semibold text-secondaryText transition hover:text-primaryText hover:bg-bgDark3 sm:w-auto"
              >
                See all features
              </a>
            </div>

            <p className="mt-5 text-xs text-secondaryText/60">
              Free forever plan · No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
