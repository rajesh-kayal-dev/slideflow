import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { BrandName } from '#/components/BrandName'
import React from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWithBranding(text: string, plain = false) {
  if (!text.includes('SlideFlow')) return text;
  
  const parts = text.split(/(SlideFlow)/g);
  return React.createElement(React.Fragment, null, 
    parts.map((part, i) => 
      part === 'SlideFlow' ? React.createElement(BrandName, { key: i, plain }) : part
    )
  );
}
