import React from 'react'
import { Check } from 'lucide-react'

interface FeatureSection1Props {
  className?: string
}

export function FeatureSection1({ className = "" }: FeatureSection1Props) {
  return (
    <section
      className={`w-full pb-16 lg:pb-24 pt-0 lg:pt-0 -mt-1 ${className}`}
      id="features-extended"
    >
      <div className="sf-fade-in is-visible">
        <div className="mx-auto flex w-11/12 flex-wrap items-center md:pl-4 xl:w-[81.25rem] xl:pr-16 xl:pl-16 2xl:w-[90.625rem]">
          <div className="mb-12 w-full lg:mb-0 lg:w-1/2">
            <div className="lg:w-unset mx-auto w-11/12 sm:w-4/5 md:w-3/4 lg:mx-auto">
              <span className="block-subtitle">Embrace Innovation</span>
              <h2 className="block-big-title mt-6 mb-8 text-4xl lg:text-5xl leading-tight">
                AI Powered presentations unlike any tool you used before
              </h2>
              <p className="text-secondaryText mb-10 leading-loose">
                Discover a new level of slide creation with our innovative and user-friendly platform.
                Transform your ideas into professional presentations with actionable AI insights.
              </p>
              <ul className="text-primaryText mb-6 space-y-4">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primaryColor/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primaryColor" />
                  </div>
                  <span>Real-time slide generation from prompts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primaryColor/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primaryColor" />
                  </div>
                  <span>Advanced layout & design suggestions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primaryColor/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primaryColor" />
                  </div>
                  <span>Seamless export to PPTX and PDF</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mx-auto flex w-3/4 flex-wrap justify-center sm:pr-8 lg:-mx-4 lg:w-1/2 lg:pt-10 lg:pl-4 xl:px-8">
            <div className="mb-8 w-full px-2 sm:w-1/2 lg:mb-0 lg:px-0">
              <div className="mb-4 rounded py-3 pr-2 pl-3">
                <div className="relative">
                  <img
                    src="/images/features/feature1.png"
                    alt="AI Gen interface"
                    className="sm:mx-unset main-border-gray mx-auto rounded-xl shadow-2xl"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/10"></div>
                </div>
              </div>
              <div className="rounded py-3 pr-2 pl-3">
                <div className="relative">
                  <img
                    src="/images/features/feature2.png"
                    alt="Smart layouts"
                    className="sm:mx-unset main-border-gray mx-auto rounded-xl shadow-2xl"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/10"></div>
                </div>
              </div>
            </div>
            <div className="hidden w-1/2 px-2 pt-12 sm:inline-block lg:mt-20 lg:pt-0">
              <div className="mb-4 rounded-lg py-3 pr-2 pl-3">
                <div className="relative">
                  <img
                    src="/images/features/feature3.png"
                    alt="Data viz"
                    className="main-border-gray rounded-xl shadow-2xl"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/10"></div>
                </div>
              </div>
              <div className="rounded-lg py-3 pr-2 pl-3">
                <div className="relative">
                  <img
                    src="/images/features/feature4.png"
                    alt="Collaboration"
                    className="main-border-gray rounded-xl shadow-2xl"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
