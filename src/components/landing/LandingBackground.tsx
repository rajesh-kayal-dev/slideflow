import React from 'react'

export function LandingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none">
      {/* Drifting Transparent Logos Only */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute opacity-[0.04] animate-float grayscale brightness-0 invert"
            style={{
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
              width: `${80 + (i * 20) % 150}px`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${30 + (i * 10) % 40}s`,
              filter: 'blur(1px)'
            }}
          >
            <img src="/SlideFlowLogo.png" alt="" className="w-full h-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  )
}
