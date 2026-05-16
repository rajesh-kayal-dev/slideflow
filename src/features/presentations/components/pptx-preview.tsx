import React, { useEffect, useRef, useState } from 'react'
import { init } from 'pptx-preview/dist/pptx-preview.es.js'
import { Loader2 } from 'lucide-react'

interface PptxPreviewProps {
  buffer: ArrayBuffer
  className?: string
}

export function PptxPreview({ buffer, className }: PptxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !buffer) return

    let previewer: any = null

    const startPreview = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Clear container
        if (containerRef.current) containerRef.current.innerHTML = ''
        
        previewer = init(containerRef.current!, {
          width: '100%',
          height: '100%',
          showPagination: true,
          showNextPrev: true,
        })

        await previewer.preview(buffer)
        setIsLoading(false)
      } catch (err) {
        console.error('PPTX Preview error:', err)
        setError('Failed to render preview')
        setIsLoading(false)
      }
    }

    startPreview()

    return () => {
      if (previewer && typeof previewer.destroy === 'function') {
        previewer.destroy()
      }
    }
  }, [buffer])

  return (
    <div className={`relative bg-black/40 rounded-[2rem] overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-[#4F46E5] mb-4" />
          <p className="text-sm font-bold text-white">Rendering slides...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 z-10 text-center p-8">
          <p className="text-red-400 font-bold mb-2">{error}</p>
          <p className="text-xs text-secondaryText">The document might be too complex for local rendering. Falling back to static info.</p>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
