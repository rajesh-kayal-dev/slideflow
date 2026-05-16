import React from 'react'

export function BrandName({ className = "", plain = false }: { className?: string, plain?: boolean }) {
  return (
    <span className={`font-['Outfit'] font-extrabold tracking-tight ${className}`}>
      Slide<span className={plain ? "" : "text-gradient-primary"}>Flow</span>
    </span>
  )
}
