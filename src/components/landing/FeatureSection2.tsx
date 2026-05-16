import React from 'react'
import { Check } from 'lucide-react'

interface FeatureSection2Props {
  className?: string
}

export function FeatureSection2({ className = "" }: FeatureSection2Props) {
  return (
    <section className={`w-full pb-16 lg:pb-24 pt-0 lg:pt-0 -mt-1 ${className}`}>
      <div className="sf-fade-in is-visible">
        <div className="mx-auto flex w-11/12 flex-wrap items-center md:pl-4 xl:w-[81.25rem] xl:pr-16 xl:pl-16 2xl:w-[90.625rem]">
          <div className="order-last mx-auto flex w-11/12 flex-wrap justify-center sm:w-3/4 sm:pr-8 lg:order-first lg:-mx-4 lg:w-1/2">
            <div className="mb-8 flex w-full flex-col justify-center px-2 md:pl-8 lg:mb-0 lg:pl-16">
              <div className="mb-4 rounded py-3 md:pr-20 md:pl-3 lg:pr-12">
                <div className="relative">
                  <img
                    src="/images/features/feature5.png"
                    alt="Tracking dashboard"
                    className="main-border-gray rounded-xl shadow-2xl"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/10"></div>
                </div>
              </div>
              <div className="rounded py-3 md:pr-2 md:pl-20 lg:pl-12">
                <div className="relative">
                  <img
                    src="/images/features/feature6.png"
                    alt="AI assistant chat"
                    className="main-border-gray rounded-xl shadow-2xl"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/10"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-12 w-full lg:mb-0 lg:w-1/2 xl:pl-8">
            <div className="lg:w-unset mx-auto w-11/12 sm:w-4/5 md:w-3/4 lg:mx-auto">
              <span className="block-subtitle">Collaborative Workspace</span>
              <h2 className="block-big-title mt-6 mb-8 text-4xl lg:text-5xl leading-tight">
                AI presentation tools you'll enjoy using
              </h2>
              <p className="text-secondaryText mb-12 leading-loose">
                Collaborate with your team and track your presentation projects with ease using our intuitive
                and efficient workspace. Stay ahead of your deadlines and improve your workflow.
              </p>
              <ul className="text-primaryText mb-6 space-y-4">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primaryColor/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primaryColor" />
                  </div>
                  <span>Real-time collaborative editing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primaryColor/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primaryColor" />
                  </div>
                  <span>Smart version history tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primaryColor/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primaryColor" />
                  </div>
                  <span>Customizable team notifications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
