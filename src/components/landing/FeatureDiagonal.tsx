import React from 'react'

interface FeatureDiagonalProps {
  reverse?: boolean
}

export function FeatureDiagonal({ reverse = false }: FeatureDiagonalProps) {
  return (
    <section className="bg-bgDark1 flex w-full flex-col items-center justify-center overflow-hidden -mt-1">

      <div className="sf-fade-in is-visible bg-bgDark1 w-full py-8 lg:py-16">
        <div className="content-container flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className={`w-full lg:w-1/2 flex flex-col ${reverse ? 'lg:order-last' : ''}`}>
            <span className="block-subtitle">Accelerate Your Success</span>
            <h2 className="block-big-title mt-6 mb-8 text-4xl lg:text-5xl leading-tight">
              {reverse ? 'Scale with Confidence' : 'Build & Launch without problems'}
            </h2>
            <p className="text-secondaryText mb-12 leading-loose">
              {reverse
                ? 'Our enterprise-grade infrastructure ensures your presentations are always available and performant, no matter the scale.'
                : 'Our platform enables you to launch your data-driven presentation projects with ease. Boost productivity and achieve better results.'}
            </p>
            <button className="contained-button h-12 w-[210px]">
              Get Started
            </button>
          </div>
          <div className="w-full lg:w-1/2">
            <img
              src="/images/features/diagonal.png"
              alt="Feature Showcase"
              className="main-border-gray rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>

      {/* Bottom Divider - Joins with next section */}
    </section>
  )
}
