import { Button } from '#/components/ui/button'
import { X, Sparkles, Edit3, Plus, Loader2, ChevronLeft } from 'lucide-react'
import { useNavigate, Link } from '@tanstack/react-router'
import type { Template } from '#/generated/client'
import { useState } from 'react'
import { TemplateCustomizer } from './TemplateCustomizer'

interface TemplatePreviewModalProps {
  template: Template
  onClose: () => void
  onUse: () => void
  isCreating?: boolean
}

export function TemplatePreviewModal({ template, onClose, onUse, isCreating }: TemplatePreviewModalProps) {
  const navigate = useNavigate()
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [customConfig, setCustomConfig] = useState(template.config)

  if (isCustomizing) {
    return (
      <div className="fixed inset-0 z-[60] animate-in zoom-in-95 duration-200">
        <TemplateCustomizer 
          template={{ ...template, config: customConfig }} 
          onSave={(newConfig) => {
            setCustomConfig(newConfig)
            setIsCustomizing(false)
          }}
          onCancel={() => setIsCustomizing(false)}
        />
      </div>
    )
  }

  // Use preview slides if available, otherwise mock slides
  const previewSlidesRaw = template.previewSlides as string[] | undefined
  
  const mockSlides = previewSlidesRaw && previewSlidesRaw.length > 0 ? 
    previewSlidesRaw.map((url, idx) => ({ id: String(idx), title: idx === 0 ? template.name : `Slide ${idx + 1}`, imageUrl: url })) :
    [
      { id: '1', title: template.name, imageUrl: template.thumbnail || 'https://via.placeholder.com/800x500?text=No+Thumbnail' },
      { id: '2', title: 'Agenda', imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop' },
      { id: '3', title: 'Key Metrics', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop' },
      { id: '4', title: 'Next Steps', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop' },
    ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-bgDark2 border border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-bgDark1/50">
          <h2 className="text-xl font-bold text-white tracking-tight">{template.name}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-secondaryText hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-[#1a1a1a]">
          {mockSlides.map((slide, idx) => (
            <div key={slide.id} className="w-full max-w-4xl mx-auto group">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                 <img 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                 <div className="absolute bottom-6 left-8">
                    <h3 className="text-3xl font-bold text-white tracking-tight">
                       {idx === 0 ? slide.title : `${slide.title}`}
                    </h3>
                 </div>
              </div>
            </div>
          ))}
          
          {/* Predefined Prompt Section */}
          <div className="w-full max-w-4xl mx-auto space-y-4">
             <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="size-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Predefined Prompt Content</h3>
             </div>
             <div className="p-6 rounded-2xl bg-bgDark1 border border-indigo-500/20 shadow-inner relative group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                   <Edit3 className="size-4 text-white" />
                </div>
                <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                   {(template as any).content || "No predefined content available."}
                </pre>
             </div>
             <p className="text-[10px] text-secondaryText text-center italic">
                * You can fully customize this content in the next step.
             </p>
          </div>
          
          {/* End of preview message */}
          <div className="text-center py-12 text-secondaryText">
             <p className="text-sm">End of template preview</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-white/5 bg-bgDark1/50 flex items-center justify-between">
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all group">
              <span className="bg-indigo-500 text-[10px] px-1.5 py-0.5 rounded text-white font-black">PRO</span>
              Create custom template
           </button>

           <div className="flex items-center gap-3">
              <Link 
                to="/templates/$templateId/customize"
                params={{ templateId: template.id }}
                className="px-6 py-2.5 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/5 transition-all flex items-center gap-2 aria-disabled:opacity-50"
                aria-disabled={isCreating}
                onClick={(e) => isCreating && e.preventDefault()}
              >
                 <Edit3 className="size-4" />
                 Edit Template & Styles
              </Link>
              <button 
                onClick={onUse}
                disabled={isCreating}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-50 min-w-[200px] justify-center"
              >
                 {isCreating ? (
                    <Loader2 className="size-5 animate-spin" />
                 ) : (
                    <Plus className="size-5" />
                 )}
                 {isCreating ? 'Creating...' : 'Create from template'}
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}
