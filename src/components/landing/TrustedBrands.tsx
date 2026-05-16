import React from 'react'

const BRANDS = [
  { name: 'Amazon', icon: 'amazon' },
  { name: 'Dropbox', icon: 'dropbox' },
  { name: 'Netflix', icon: 'netflix' },
  { name: 'Stripe', icon: 'stripe' },
  { name: 'Spotify', icon: 'spotify' },
  { name: 'Slack', icon: 'slack' },
]

export function TrustedBrands() {
  return (
    <section className="bg-bgDark1 w-full py-8 sm:py-16" id="trusted">
      <div className="sf-fade-in is-visible">
        <div className="content-container">
          <div className="-mx-4 flex flex-col items-center justify-center text-center lg:flex-row lg:text-left">
            <div className="mb-12 w-full px-4 lg:mb-0 lg:w-1/2">
              <div className="flex flex-col">
                <h2 className="text-primaryText mb-2 text-4xl font-bold tracking-normal sm:text-5xl 2xl:text-6xl">
                  Trusted by brands
                </h2>
                <h2 className="to-primaryColor bg-gradient-to-r from-primaryColor/60 bg-clip-text text-4xl font-bold tracking-normal text-transparent sm:text-5xl 2xl:text-6xl">
                  all over the world
                </h2>
              </div>
            </div>
            <div className="mx-auto w-2/3 sm:w-[38.75rem] lg:mx-0 lg:w-1/2 lg:pl-10">
              <div className="-m-4 flex flex-wrap items-center justify-center">
                {BRANDS.map((brand) => (
                  <div key={brand.name} className="flex w-1/2 justify-center py-6 sm:w-1/3">
                    {/* Placeholder for SVG Logos - Using text for now as in the original SlideFlow style but better sized */}
                    <div className="flex items-center gap-2 group transition-all duration-300">
                      <span className="text-xl font-bold text-white/40 group-hover:text-white/80 transition-colors">{brand.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
