import { ModularSlide } from '#/features/templates/blocks/ModularSlide'
import type { TemplateConfig } from '#/features/templates/types'

type SlidePreviewProps = {
  slide: {
    id: string
    order: number
    title: string
    content: string
    notes?: string | null
    imageUrl?: string | null
    layoutType?: any
  }
  isFullscreen?: boolean
  template?: any
  onUpdate?: (data: { title?: string; content?: string }) => void
  onRegenerateImage?: (prompt: string) => void
  onRegenerateImageAuto?: () => void
  onDeleteImage?: () => void
  isUpdatingImage?: boolean
}

const DEFAULT_CONFIG: TemplateConfig = {
  colors: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    background: '#18181b',
    text: '#ffffff',
    accent: '#3b82f6',
  },
  typography: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
    sizes: {
      heading: '3rem',
      body: '1.25rem',
    },
  },
  layout: {
    spacing: '2rem',
    borderRadius: '1.5rem',
  },
}

export function SlidePreview({ 
  slide, 
  isFullscreen, 
  template, 
  onUpdate,
  onRegenerateImage,
  onRegenerateImageAuto,
  onDeleteImage,
  isUpdatingImage
}: SlidePreviewProps) {
  const config = (template?.config as TemplateConfig) || DEFAULT_CONFIG

  return (
    <div className={`relative w-full h-full ${isFullscreen ? '' : 'aspect-video'}`}>
      <ModularSlide 
        slide={slide as any} 
        config={config} 
        isFullscreen={isFullscreen} 
        onUpdate={onUpdate}
        onRegenerateImage={onRegenerateImage}
        onRegenerateImageAuto={onRegenerateImageAuto}
        onDeleteImage={onDeleteImage}
        isUpdatingImage={isUpdatingImage}
      />
      
      {slide.notes && !isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-black/40 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-1">Speaker notes</p>
          <p className="text-sm text-white/90 leading-relaxed line-clamp-2">
            {slide.notes}
          </p>
        </div>
      )}
    </div>
  )
}
