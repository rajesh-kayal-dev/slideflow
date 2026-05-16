import { Wand2, Globe, Sparkles, FileText, Layout, ArrowLeft, MousePointer2 } from 'lucide-react'
import { useState } from 'react'
import {
  SLIDE_STYLES,
  TONE_OPTIONS,
  LAYOUT_OPTIONS,
  PRESENTATION_TEMPLATES,
  presentationQueryKeys,
} from '#/features/presentations'
import { UrlGenerateForm } from '#/features/presentations'
import { createPresentation, enhancePresentationPrompt } from '#/features/presentations/actions/presentation-mutations'
import { createPresentationFromUrl as createPresentationFromUrlFn } from '#/features/presentations/actions/url-presentation-mutations'
import { getTemplates } from '#/features/presentations/actions/template-queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { TemplatePreviewModal } from '#/features/presentations'
import type { Template } from '#/generated/client'
import { LoadingScreen } from '#/components/ui/LoadingScreen'

type FormState = {
  content: string
  slideCount: number
  style: (typeof SLIDE_STYLES)[number]['value']
  tone: (typeof TONE_OPTIONS)[number]['value']
  layout: (typeof LAYOUT_OPTIONS)[number]['value']
}

type View = 'selection' | 'generate' | 'text' | 'template' | 'import'

type UrlFormData = {
  url: string
  slideCount: number
  style: FormState['style']
  tone: FormState['tone']
  layout: FormState['layout']
}

interface PresentationBuilderProps {
  onCreated?: (presentationId: string) => void
}

export function PresentationBuilder({ onCreated }: PresentationBuilderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [view, setView] = useState<View>('selection')
  const [form, setForm] = useState<FormState>({
    content: '',
    slideCount: 8,
    style: 'minimal',
    tone: 'formal',
    layout: 'balanced',
  })

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => getTemplates()
  })

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const createMut = useMutation({
    mutationFn: () =>
      createPresentation({
        data: {
          prompt: form.content.trim(),
          slideCount: form.slideCount,
          style: form.style,
          tone: form.tone,
          layout: form.layout,
        },
      }),
    onSuccess: (presentation) => {
      toast.success('Presentation created')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      onCreated?.(presentation.id)
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not create presentation')
    },
  })

  const { createPresentationFromUrl } = useUrlMutation(queryClient, onCreated, navigate)

  const handleGenerate = () => {
    if (!form.content.trim()) {
      toast.error('Please enter your content first')
      return
    }
    createMut.mutate()
  }

  const handleTemplateClick = (template: (typeof PRESENTATION_TEMPLATES)[number]) => {
    setForm({
      content: template.content,
      slideCount: template.slides,
      style: template.style as FormState['style'],
      tone: template.tone as FormState['tone'],
      layout: template.layout as FormState['layout'],
    })
    setView('generate')
  }

  const [isEnhancing, setIsEnhancing] = useState(false)
  const isPending = createMut.isPending

  const handleEnhance = async () => {
    if (!form.content.trim()) {
      toast.error('Please enter a topic first')
      return
    }

    try {
      setIsEnhancing(true)
      const { enhancedPrompt } = await enhancePresentationPrompt({
        data: {
          prompt: form.content.trim(),
          slideCount: form.slideCount,
          style: form.style,
          tone: form.tone,
          layout: form.layout,
        },
      })
      setForm((s) => ({ ...s, content: enhancedPrompt }))
      toast.success('Prompt enhanced!')
    } catch (error) {
      toast.error('Failed to enhance prompt')
    } finally {
      setIsEnhancing(false)
    }
  }

  if (view === 'selection') {
    return (
      <div className="w-full">
        {isPending && <LoadingScreen message="AI is crafting your presentation..." />}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Create with AI</h1>
          <p className="text-secondaryText text-lg">How would you like to get started?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-6xl mx-auto">
          <SelectionCard
            title="Generate"
            description="Create from a one-line prompt in a few seconds"
            icon={<Sparkles className="size-8 text-indigo-400" />}
            onClick={() => setView('generate')}
            illustration="bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
            badge="Not sure? Start here!"
          />
          <SelectionCard
            title="Paste In text"
            description="Create from notes, an outline, or existing content"
            icon={<FileText className="size-8 text-emerald-400" />}
            onClick={() => setView('text')}
            illustration="bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
          />
          <SelectionCard
            title="Create from template"
            description="Create using the structure or layouts from a template"
            icon={<Layout className="size-8 text-amber-400" />}
            onClick={() => setView('template')}
            illustration="bg-gradient-to-br from-amber-500/20 to-orange-500/20"
          />
          <SelectionCard
            title="Import file or URL"
            description="Enhance existing docs, presentations, or webpages"
            icon={<Globe className="size-8 text-rose-400" />}
            onClick={() => navigate({ to: '/import' })}
            illustration="bg-gradient-to-br from-rose-500/20 to-pink-500/20"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      {isPending && <LoadingScreen message="AI is crafting your presentation..." />}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setView('selection')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-secondaryText hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {view === 'generate' && 'Generate with AI'}
            {view === 'text' && 'Paste in Text'}
            {view === 'template' && 'Choose a Template'}
            {view === 'import' && 'Import URL or File'}
          </h2>
          <p className="text-secondaryText text-sm mt-0.5">
            {view === 'generate' && "Describe your presentation and let AI handle the rest."}
            {view === 'text' && "Paste your notes or outline to generate slides."}
            {view === 'template' && "Pick a starting point from our curated collection."}
            {view === 'import' && "Turn any webpage or document into a presentation."}
          </p>
        </div>
      </div>

      <div className="bg-bgDark2/40 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
        {(view === 'generate' || view === 'text') && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="relative group/textarea">
                <textarea
                  placeholder={view === 'text' ? "Paste your notes, outline, or full text here..." : "Describe your presentation topic, e.g., 'A pitch deck for a new sustainable fashion brand'"}
                  value={form.content}
                  onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
                  className="w-full h-48 p-4 pr-12 rounded-xl bg-bgDark1 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !form.content.trim()}
                  className="absolute bottom-4 right-4 p-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-2 group/enhance disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  title="Enhance with AI"
                >
                  {isEnhancing ? (
                    <Sparkles className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4 group-hover/enhance:scale-125 transition-transform" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider max-w-0 group-hover/enhance:max-w-xs transition-all duration-500 overflow-hidden whitespace-nowrap">
                    Enhance
                  </span>
                </button>
              </div>
              <div className="flex justify-between text-xs text-secondaryText px-1">
                <span>{form.content.length.toLocaleString()} characters</span>
                <span>Markdown supported</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 bg-bgDark1/50 p-4 rounded-xl border border-white/5">
                <label className="text-[10px] font-bold text-secondaryText uppercase tracking-widest">
                  Slides: {form.slideCount}
                </label>
                <input
                  type="range"
                  min="3" max="20" step="1"
                  value={form.slideCount}
                  onChange={(e) => setForm((s) => ({ ...s, slideCount: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-500 h-1 mt-2"
                />
              </div>

              {[
                { key: 'style', label: 'Style', options: SLIDE_STYLES },
                { key: 'tone', label: 'Tone', options: TONE_OPTIONS },
                { key: 'layout', label: 'Layout', options: LAYOUT_OPTIONS },
              ].map(({ key, label, options }) => (
                <div key={key} className="space-y-2 bg-bgDark1/50 p-3 rounded-xl border border-white/5">
                  <label className="text-[10px] font-bold text-secondaryText uppercase tracking-widest">
                    {label}
                  </label>
                  <select
                    value={form[key as keyof FormState]}
                    onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value as any }))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                  >
                    {options.map((o) => (
                      <option key={o.value} value={o.value} className="bg-bgDark1">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isPending || !form.content.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isPending ? (
                  <Sparkles className="size-5 animate-pulse" />
                ) : (
                  <Wand2 className="size-5 group-hover:rotate-12 transition-transform" />
                )}
                {isPending ? 'Generating...' : 'Create Presentation'}
              </button>
            </div>
          </div>
        )}

        {view === 'template' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingTemplates ? (
               Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="h-48 rounded-xl bg-bgDark1 animate-pulse border border-white/5" />
               ))
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template)}
                  className="text-left p-4 rounded-xl bg-bgDark1 border border-white/10 hover:border-indigo-500/50 transition-all group overflow-hidden relative"
                >
                  <div className="h-32 w-full bg-bgDark2 rounded-lg mb-3 flex items-center justify-center border border-white/5 group-hover:bg-indigo-500/5 transition-colors relative overflow-hidden">
                    {template.thumbnail ? (
                       <img src={template.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={template.name} />
                    ) : (
                       <Layout className="size-8 text-white/20 group-hover:text-indigo-400 transition-colors" />
                    )}
                    {template.googleId && (
                       <div className="absolute top-2 right-2 bg-bgDark1/80 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                          <Globe className="size-3 text-indigo-400" />
                          <span className="text-[8px] font-black uppercase text-white">Google</span>
                       </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white mb-1">{template.name}</h3>
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] text-secondaryText uppercase font-bold tracking-wider">{template.category}</p>
                     <div className="size-2 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {selectedTemplate && (
          <TemplatePreviewModal 
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            isCreating={createMut.isPending}
            onUse={() => {
              // Set form values from template and switch to generate view
              const config = selectedTemplate.config as any
              setForm({
                content: (selectedTemplate as any).content || `Presentation using ${selectedTemplate.name} template`,
                slideCount: 10,
                style: (selectedTemplate.themeType as any) || 'minimal',
                tone: 'formal',
                layout: (selectedTemplate.layoutType as any) || 'balanced',
              })
              setView('generate')
            }}
          />
        )}

        {view === 'import' && (
          <div className="pt-2">
            <UrlGenerateForm
              isPending={createPresentationFromUrl.isPending}
              onSubmit={(data) => createPresentationFromUrl.mutate(data as UrlFormData)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function SelectionCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  illustration,
  badge 
}: { 
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  illustration: string
  badge?: string
}) {
  return (
    <div className="relative group">
      {badge && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-bgDark1 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-xl animate-bounce">
          {badge}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
        </div>
      )}
      <button
        onClick={onClick}
        className="w-full bg-white dark:bg-bgDark2/60 border border-white/10 rounded-2xl p-1 flex flex-col h-full hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all hover:-translate-y-1 overflow-hidden group"
      >
        <div className={`h-32 w-full ${illustration} rounded-xl flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-500">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/30 blur-[60px] rounded-full" />
          </div>
          <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        <div className="p-5 text-left">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{title}</h3>
          <p className="text-sm text-secondaryText leading-relaxed">{description}</p>
        </div>
      </button>
    </div>
  )
}

function useUrlMutation(
  queryClient: ReturnType<typeof useQueryClient>,
  onCreated: ((id: string) => void) | undefined,
  navigate: ReturnType<typeof useNavigate>,
) {
  const createPresentationFromUrl = useMutation({
    mutationFn: (data: UrlFormData) => createPresentationFromUrlFn({ data }),
    onSuccess: (presentation) => {
      toast.success('Scraping started! Generating your presentation…')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      onCreated?.(presentation.id)
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not start URL generation')
    },
  })

  return { createPresentationFromUrl }
}
