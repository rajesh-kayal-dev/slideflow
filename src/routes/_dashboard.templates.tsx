import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { LayoutTemplate, Search, ChevronDown, Sparkles, Filter, MoreHorizontal, Globe } from 'lucide-react'
import { TemplatePreviewModal, presentationQueryKeys } from '#/features/presentations'
import { useState, useMemo } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createPresentation } from '#/features/presentations/actions/presentation-mutations'
import { getTemplates } from '#/features/presentations/actions/template-queries'
import { getGoogleSlidesTemplates } from '#/features/presentations/actions/google-template-queries'
import { toast } from 'sonner'

export const Route = createFileRoute('/_dashboard/templates')({
  component: TemplatesPage,
})

const CATEGORIES = [
  'All',
  'Google Slides',
  'Startup',
  'Company',
  'Creative',
  'Education',
  'Reporting',
  'Project Management',
  'Fundraising',
  'Sales',
  'Marketing',
  'Consulting',
  'People',
  'Strategy'
]

function TemplatesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Recommended')
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  const { data: dbTemplates = [], isLoading: isLoadingDb } = useQuery({
    queryKey: ['templates'],
    queryFn: () => getTemplates(),
    retry: 1
  })

  const { data: googleSlides = [], isLoading: isLoadingGoogle } = useQuery({
    queryKey: ['google-slides'],
    queryFn: () => getGoogleSlidesTemplates(),
    enabled: activeCategory === 'Google Slides',
    retry: 1
  })

  const isLoading = isLoadingDb || (activeCategory === 'Google Slides' && isLoadingGoogle)

  const createMut = useMutation({
    mutationFn: (template: any) =>
      createPresentation({
        data: {
          prompt: template.name,
          slideCount: 10,
          style: template.themeType || 'professional',
          tone: 'informative',
          layout: template.layoutType || 'balanced',
          templateId: template.isGoogle ? undefined : template.id,
          googleTemplateId: template.isGoogle ? template.id : undefined,
        },
      }),
    onSuccess: (presentation) => {
      toast.success('Presentation created from template')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not create presentation')
    },
  })

  const displayTemplates = useMemo(() => {
    if (activeCategory === 'Google Slides') {
      return googleSlides.map((file: any) => ({
        id: file.id,
        name: file.name,
        category: 'Google Slides',
        thumbnail: file.thumbnailLink,
        themeType: 'professional',
        layoutType: 'visual',
        isGoogle: true
      }))
    }

    return dbTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            template.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === 'All' || template.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [dbTemplates, googleSlides, searchQuery, activeCategory])

  const handleUseTemplate = (template: any) => {
    createMut.mutate(template)
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
           <div className="h-5 w-5 bg-indigo-500/10 rounded flex items-center justify-center">
              <LayoutTemplate className="size-3 text-indigo-500" />
           </div>
           <h1 className="text-sm font-bold text-indigo-500 uppercase tracking-widest">Explore templates</h1>
        </div>
        <p className="text-secondaryText text-sm">Professionally designed white-label templates</p>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-secondaryText group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search templates" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bgDark2/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-secondaryText focus:outline-none focus:border-indigo-500/50 transition-all shadow-sm"
              />
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-600/10">
              Search
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-secondaryText group cursor-pointer hover:text-white transition-colors">
             <span>Sort by:</span>
             <span className="text-white font-bold">{sortBy}</span>
             <ChevronDown className="size-4" />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === category 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                  : 'bg-white/5 border-transparent text-secondaryText hover:text-white hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State - Skeleton Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse">
              <div className="aspect-[16/10] rounded-xl bg-white/5 border border-white/5" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {displayTemplates.map((template: any) => (
            <div key={template.id} className="group cursor-pointer flex flex-col h-full">
              {/* Card Thumbnail */}
              <div 
                onClick={() => setPreviewTemplate(template)}
                className="relative aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-bgDark2 shadow-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-indigo-500/10 group-hover:border-indigo-500/30"
              >
                <img 
                  src={template.thumbnail || (template.isGoogle ? 'https://www.gstatic.com/images/branding/product/2x/slides_2020q4_48dp.png' : 'https://via.placeholder.com/800x500?text=No+Thumbnail')} 
                  alt={template.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                   <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full text-sm font-black shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                   >
                     {template.isGoogle ? 'Use Slide' : 'View template'}
                   </button>
                </div>

                {/* Badge/Icon overlay */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white/80 border border-white/10 uppercase tracking-widest flex items-center gap-1.5">
                   {template.isGoogle && <Globe className="size-3 text-indigo-400" />}
                   {template.category}
                </div>
              </div>

              {/* Card Info */}
              <div className="mt-4 px-1 flex flex-col gap-1">
                <h3 
                  onClick={() => setPreviewTemplate(template)}
                  className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate"
                >
                  {template.name}
                </h3>
                <div className="flex items-center justify-between">
                   <p className="text-[11px] text-secondaryText capitalize">{template.themeType} • {template.layoutType}</p>
                   <button className="text-secondaryText hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="size-4" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && displayTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
           <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Search className="size-8 text-secondaryText opacity-20" />
           </div>
           <h2 className="text-xl font-bold text-white mb-2">No templates found</h2>
           <p className="text-secondaryText text-sm">Try adjusting your search or category filters</p>
           <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-6 text-indigo-400 font-bold text-sm hover:underline"
           >
             Clear all filters
           </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal 
          template={previewTemplate}
          isCreating={createMut.isPending}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => handleUseTemplate(previewTemplate)}
        />
      )}

    </div>
  )
}
