import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { 
  Palette, 
  Type, 
  Layout, 
  Sparkles, 
  ArrowLeft, 
  Save, 
  Wand2, 
  Check, 
  Settings2,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
  LayoutGrid,
  Type as TypeIcon,
  Maximize2,
  X,
  MessageSquare
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTemplate } from '#/features/presentations/actions/template-queries'
import { 
  PRESENTATION_TEMPLATES,
} from '#/features/presentations'
import { createPresentation } from '#/features/presentations/actions/presentation-mutations'
import { DashboardLayout } from '#/components/dashboard/DashboardLayout'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { toast } from 'sonner'
import { z } from 'zod'

export const Route = createFileRoute('/templates/$templateId/customize')({
  component: TemplateCustomizePage,
})

const FONT_OPTIONS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Outfit', value: 'Outfit, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
]

const STYLE_PRESETS = [
  { name: 'Minimal', value: 'minimal', colors: { primary: '#4F46E5', background: '#FFFFFF', text: '#1A1A1A' } },
  { name: 'Dark Mode', value: 'dark', colors: { primary: '#4F46E5', background: '#0a0a0a', text: '#f8fafc' } },
  { name: 'Elegant', value: 'elegant', colors: { primary: '#8b5cf6', background: '#fdfcfb', text: '#2d2d2d' } },
  { name: 'Vibrant', value: 'vibrant', colors: { primary: '#ec4899', background: '#ffffff', text: '#1a1a1a' } },
]

function TemplateCustomizePage() {
  const { templateId } = useParams({ from: '/templates/$templateId/customize' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: template, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => getTemplate({ data: templateId })
  })

  // Find static template as fallback
  const staticTemplate = useMemo(() => 
    PRESENTATION_TEMPLATES.find(t => t.id === templateId || t.label === template?.name),
    [templateId, template?.name]
  )

  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'structure'>('colors')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  
  // Customization State
  const [config, setConfig] = useState<any>(null)
  const [promptData, setPromptData] = useState({
    topic: '',
    name: 'Jane Doe',
    company: 'SlideFlow AI',
    role: 'Product Manager',
    goals: 'Professional engagement',
    details: '',
    fullPrompt: ''
  })
  const [isStructuredMode, setIsStructuredMode] = useState(true)

  useEffect(() => {
    if (template && !config) {
      const initialConfig = (template.config as any) || {
        colors: { primary: '#4F46E5', background: '#FFFFFF', text: '#1A1A1A' },
        typography: { fontFamily: 'Inter, sans-serif' },
        spacing: 'balanced'
      }
      setConfig(initialConfig)
      
      const predefinedContent = (template as any).content || staticTemplate?.content || ""

      // Seed prompt data
      setPromptData(prev => ({
        ...prev,
        topic: template.name,
        details: predefinedContent,
        fullPrompt: predefinedContent || `Create a presentation for ${template.name}. \nTopic: ${template.name}\nTarget Audience: Business Professionals`
      }))
    }
  }, [template, config, staticTemplate])

  const createMut = useMutation({
    mutationFn: (finalPrompt: string) =>
      createPresentation({
        data: {
          prompt: finalPrompt,
          slideCount: 8,
          style: config?.stylePreset || 'modern',
          tone: 'professional',
          layout: template?.layoutType || 'balanced',
          // @ts-ignore
          templateId: template?.id,
          config: config
        },
      }),
    onSuccess: (presentation) => {
      toast.success('Presentation generated successfully!')
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    }
  })

  const getGeneratedPrompt = () => {
    return `TEMPLATE: ${template?.name}
TOPIC: ${promptData.topic}
PRESENTER: ${promptData.name}
COMPANY: ${promptData.company}
ROLE: ${promptData.role}
GOALS: ${promptData.goals}
DETAILS: ${promptData.details}

Generate a presentation that strictly follows the ${template?.name} template structure.
`
  }

  const handleSyncToFullPrompt = () => {
    setPromptData(prev => ({
      ...prev,
      fullPrompt: getGeneratedPrompt()
    }))
    setIsStructuredMode(false)
    toast.success('Synced structured data to full prompt!')
  }

  const handleGenerate = () => {
    const finalPrompt = isStructuredMode ? getGeneratedPrompt() : promptData.fullPrompt

    createMut.mutate(finalPrompt)
  }

  if (isLoading || !config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a] text-secondaryText">
           <div className="flex flex-col items-center gap-4">
              <Sparkles className="size-8 animate-pulse text-indigo-500" />
              <p className="font-bold uppercase tracking-widest text-xs">Loading Customizer...</p>
           </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] overflow-hidden text-white">
      
      {/* Header - Matches Screenshot */}
      <div className="h-20 shrink-0 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-10">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate({ to: '/workspace' })}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
            >
               <ArrowLeft className="size-5" />
            </button>
            <div>
               <h1 className="text-xl font-bold text-white tracking-tight">Choose a Template</h1>
               <p className="text-xs text-white/40 font-medium">Pick a starting point from our curated collection.</p>
            </div>
         </div>

         <button 
           onClick={() => navigate({ to: '/workspace' })}
           className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all"
         >
            <X className="size-6" />
         </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar Controls - Matches Screenshot Styling */}
         <div className="w-[420px] border-r border-white/5 flex flex-col bg-[#111111] overflow-hidden">
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 flex flex-col gap-10">
               {/* Prompt Section - THE FOCUS */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-indigo-500" />
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Prompt Content</h3>
                     </div>
                     <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                        <button 
                           onClick={() => setIsStructuredMode(true)}
                           className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${isStructuredMode ? 'bg-[#1a1a1a] text-indigo-500 shadow-sm' : 'text-white/40 hover:text-white'}`}
                        >
                           Structured
                        </button>
                        <button 
                           onClick={() => setIsStructuredMode(false)}
                           className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${!isStructuredMode ? 'bg-[#1a1a1a] text-indigo-500 shadow-sm' : 'text-white/40 hover:text-white'}`}
                        >
                           Full Prompt
                        </button>
                     </div>
                  </div>

                   {/* Add a quick action button */}
                   {!isStructuredMode && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <button 
                          onClick={handleSyncToFullPrompt}
                          className="w-full py-3 border border-dashed border-indigo-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 group"
                        >
                           <Wand2 className="size-3.5 group-hover:rotate-12 transition-transform" />
                           Sync from structured content
                        </button>
                      </div>
                   )}

                  {isStructuredMode ? (
                     <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Presentation Topic</label>
                           <Input 
                              value={promptData.topic}
                              onChange={(e) => setPromptData(p => ({ ...p, topic: e.target.value }))}
                              placeholder="e.g. Sustainable Energy Future"
                              className="h-14 bg-white/5 border-white/10 text-white text-base rounded-2xl focus:ring-indigo-500/50 transition-all font-bold"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Presenter Name</label>
                              <Input 
                                 value={promptData.name}
                                 onChange={(e) => setPromptData(p => ({ ...p, name: e.target.value }))}
                                 placeholder="Jane Doe"
                                 className="h-12 bg-white/5 border-white/10 text-white text-sm rounded-xl"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Company</label>
                              <Input 
                                 value={promptData.company}
                                 onChange={(e) => setPromptData(p => ({ ...p, company: e.target.value }))}
                                 placeholder="SlideFlow AI"
                                 className="h-12 bg-white/5 border-white/10 text-white text-sm rounded-xl"
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Specific Details & Notes</label>
                           <Textarea 
                              value={promptData.details}
                              onChange={(e) => setPromptData(p => ({ ...p, details: e.target.value }))}
                              placeholder="Describe the key message or specific points you want to cover..."
                              className="h-40 bg-white/5 border-white/10 text-white text-sm rounded-2xl resize-none custom-scrollbar leading-relaxed"
                           />
                        </div>
                     </div>
                  ) : (
                     <div className="animate-in fade-in duration-300">
                        <Textarea 
                           value={promptData.fullPrompt}
                           onChange={(e) => setPromptData(p => ({ ...p, fullPrompt: e.target.value }))}
                           placeholder="Describe your presentation in detail..."
                           className="h-[420px] bg-white/5 border-white/10 text-white text-sm rounded-2xl resize-none custom-scrollbar leading-relaxed p-6 font-medium"
                        />
                        <p className="mt-4 text-[10px] text-white/20 italic">
                           * In Full Prompt mode, you have complete control over the AI instructions.
                        </p>
                     </div>
                  )}
               </div>

               <div className="h-px bg-white/5 my-4" />

               <div>
                  <h2 className="text-xl font-bold text-white mb-1">Visual Styles</h2>
                  <p className="text-xs text-white/40 mb-8">Customize colors, fonts and structure</p>

                  <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-10">
                     {[
                       { id: 'colors', icon: Palette, label: 'Colors' },
                       { id: 'fonts', icon: TypeIcon, label: 'Fonts' },
                       { id: 'structure', icon: LayoutGrid, label: 'Structure' }
                     ].map((tab) => (
                       <button
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id as any)}
                         className={`flex flex-col items-center gap-1.5 py-3 rounded-lg transition-all ${
                           activeTab === tab.id ? 'bg-[#1a1a1a] text-indigo-500 shadow-sm' : 'text-white/40 hover:text-white'
                         }`}
                       >
                          <tab.icon className="size-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                       </button>
                     ))}
                  </div>

                  <div className="space-y-8">
                     {activeTab === 'colors' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                           {[
                             { id: 'text', label: 'TEXT' },
                             { id: 'primary', label: 'PRIMARY' },
                             { id: 'background', label: 'BACKGROUND' }
                           ].map((c) => (
                              <div key={c.id} className="space-y-2">
                                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{c.label}</label>
                                 <div className="flex gap-3">
                                    <div className="relative group">
                                       <input 
                                         type="color" 
                                         value={config.colors[c.id]} 
                                         onChange={(e) => setConfig((s: any) => ({ ...s, colors: { ...s.colors, [c.id]: e.target.value }, stylePreset: 'custom' }))}
                                         className="size-12 rounded-xl bg-bgDark1 border border-white/10 cursor-pointer overflow-hidden p-0 absolute opacity-0"
                                       />
                                       <div 
                                         className="size-12 rounded-xl border border-white/10 flex items-center justify-center transition-all group-hover:scale-105"
                                         style={{ backgroundColor: config.colors[c.id] }}
                                       >
                                          <div className="size-4 rounded-sm border border-white/20 mix-blend-difference bg-white opacity-20" />
                                       </div>
                                    </div>
                                    <Input 
                                      value={config.colors[c.id].toUpperCase()} 
                                      onChange={(e) => setConfig((s: any) => ({ ...s, colors: { ...s.colors, [c.id]: e.target.value }, stylePreset: 'custom' }))}
                                      className="h-12 bg-white/5 border-white/10 text-white font-mono text-xs rounded-xl focus:ring-indigo-500/50"
                                    />
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === 'fonts' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                           {FONT_OPTIONS.map((font) => (
                              <button
                                key={font.value}
                                onClick={() => setConfig((s: any) => ({ ...s, typography: { ...s.typography, fontFamily: font.value } }))}
                                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                                   config.typography.fontFamily === font.value ? 'bg-white/10 border-indigo-500 shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/20'
                                }`}
                                style={{ fontFamily: font.value }}
                              >
                                 <span className="text-sm text-white">{font.name}</span>
                                 {config.typography.fontFamily === font.value && <Check className="size-4 text-indigo-500" />}
                              </button>
                           ))}
                        </div>
                     )}

                     {activeTab === 'structure' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                           {['compact', 'balanced', 'spacious'].map((s) => (
                              <button
                                key={s}
                                onClick={() => setConfig((prev: any) => ({ ...prev, spacing: s }))}
                                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all capitalize ${
                                   config.spacing === s ? 'bg-white/10 border-indigo-500' : 'bg-white/5 border-white/5 hover:border-white/20'
                                }`}
                              >
                                 <span className="text-sm text-white font-bold">{s}</span>
                                 {config.spacing === s && <Check className="size-4 text-indigo-500" />}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Footer - Matches Screenshot */}
            <div className="p-10 border-t border-white/5 bg-[#0d0d0d] flex flex-col gap-4">
               <Button 
                  onClick={handleGenerate}
                  disabled={createMut.isPending}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50"
               >
                  {createMut.isPending ? <Sparkles className="size-5 animate-pulse" /> : <Save className="size-5" />}
                  <span className="text-sm font-black uppercase tracking-wider">
                     {createMut.isPending ? 'Generating Presentation...' : 'Apply Customizations'}
                  </span>
               </Button>
               <button 
                 onClick={() => navigate({ to: '/workspace' })}
                 className="text-xs font-bold text-white/40 hover:text-white transition-colors py-2"
               >
                  Cancel
               </button>
            </div>
         </div>

         {/* Live Preview Area - Matches Screenshot Layout */}
         <div className="flex-1 bg-[#0a0a0a] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50" />
            
            <div className="p-8 flex items-center justify-between z-10">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">LIVE PREVIEW</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Syncing changes</span>
               </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-12 overflow-hidden">
               <div 
                  className={`transition-all duration-1000 shadow-[0_60px_150px_rgba(0,0,0,0.9)] border relative overflow-hidden flex flex-col group ${
                     previewDevice === 'desktop' ? 'aspect-[16/9] w-full max-w-[900px]' : 
                     previewDevice === 'tablet' ? 'aspect-[4/3] w-[640px]' : 
                     'aspect-[9/16] w-[340px]'
                  }`}
                  style={{ 
                     backgroundColor: config.colors.background,
                     fontFamily: config.typography.fontFamily,
                     borderColor: `${config.colors.primary}20`,
                     borderRadius: config.spacing === 'compact' ? '0px' : config.spacing === 'balanced' ? '40px' : '80px'
                  }}
               >
                  {/* Subtle Light Leak */}
                  <div 
                    className="absolute -top-1/4 -right-1/4 size-full blur-[120px] opacity-10 transition-all duration-1000 pointer-events-none"
                    style={{ backgroundColor: config.colors.primary }}
                  />

                  <div className="flex-1 flex flex-col justify-center p-20 relative z-10">
                     <div className="space-y-10">
                        <div 
                          className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest"
                          style={{ 
                              borderColor: `${config.colors.primary}30`,
                              color: config.colors.primary,
                              backgroundColor: `${config.colors.primary}08`
                          }}
                        >
                           <Sparkles className="size-3.5" />
                           {promptData.company || 'YOUR COMPANY'}
                        </div>
                        
                        <h1 
                          className="text-6xl font-black tracking-tight leading-[0.9] transition-all duration-500"
                          style={{ color: config.colors.text }}
                        >
                           {promptData.topic || template?.name || 'Your Title'}
                        </h1>
                        
                        <div className="h-3 w-32 rounded-full" style={{ backgroundColor: config.colors.primary }} />

                        <div 
                          className="text-lg max-w-2xl font-medium leading-relaxed transition-all duration-500 line-clamp-[6] overflow-hidden"
                          style={{ color: `${config.colors.text}cc` }}
                        >
                           {promptData.details || 'Experience the next level of presentation design. Completely customizable and AI-ready.'}
                        </div>
                        
                        <div className="pt-8 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div 
                                className="size-14 rounded-full flex items-center justify-center font-black text-lg transition-all duration-500 shadow-xl"
                                style={{ backgroundColor: config.colors.primary, color: config.colors.background }}
                              >
                                 {promptData.name ? promptData.name[0].toUpperCase() : 'U'}
                              </div>
                              <div>
                                 <p className="text-sm font-black uppercase tracking-widest" style={{ color: config.colors.text }}>{promptData.name || 'Your Name'}</p>
                                 <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider" style={{ color: config.colors.text }}>{promptData.role || 'Your Role'}</p>
                              </div>
                           </div>
                           
                           <div className="text-[10px] font-black opacity-20 uppercase tracking-[0.4em]" style={{ color: config.colors.text }}>
                              SLIDE 01 / {template?.name?.toUpperCase()}
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: config.colors.primary }} />
               </div>
            </div>

            {/* Device Switcher Overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center bg-white/5 backdrop-blur-3xl rounded-2xl p-1.5 border border-white/10 shadow-2xl z-20">
               {[
                  { id: 'desktop', icon: Monitor, label: 'Desktop' },
                  { id: 'tablet', icon: Tablet, label: 'Tablet' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile' }
               ].map((d) => (
                  <button 
                    key={d.id}
                    onClick={() => setPreviewDevice(d.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${previewDevice === d.id ? 'bg-white text-bgDark1 shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  >
                     <d.icon className="size-4" />
                     <span className="text-[10px] font-bold uppercase tracking-wider">{d.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  )
}
