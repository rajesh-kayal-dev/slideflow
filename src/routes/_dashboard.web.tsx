import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/auth.functions'
import { Globe, Sparkles, ArrowRight, Clock, Zap, Search } from 'lucide-react'
import { UrlGenerateForm } from '#/features/presentations'
import { presentationQueryKeys } from '#/features/presentations'
import { listPresentations } from '#/features/presentations/api/presentation-queries'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createPresentationFromUrl as createPresentationFromUrlFn } from '#/features/presentations/actions/url-presentation-mutations'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { PresentationHistory } from '#/components/dashboard/PresentationHistory'
import { LoadingScreen } from '#/components/ui/LoadingScreen'
import React from 'react'

export const Route = createFileRoute('/_dashboard/web')({
  component: WebPage,
})

function WebPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: presentations = [], isPending: listPending } = useQuery({
    queryKey: presentationQueryKeys.list(),
    queryFn: () => listPresentations(),
  })

  // Filter for web presentations
  const webPresentations = presentations.filter(p => p.contentType === 'url')

  const createPresentationFromUrl = useMutation({
    mutationFn: (data: any) => createPresentationFromUrlFn({ data }),
    onSuccess: (presentation) => {
      toast.success('Scraping started! Generating your presentation…')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not start URL generation')
    },
  })

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {createPresentationFromUrl.isPending && (
        <LoadingScreen message="Scraping webpage & crafting slides..." />
      )}
      
      {/* Hero Section */}
      <div className="relative mb-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -z-10" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Globe className="size-3" />
          Web to Presentation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Turn any <span className="text-indigo-400 font-black">URL</span> into a <br /> beautiful presentation
        </h1>
        <p className="text-secondaryText text-lg max-w-2xl mx-auto">
          Paste a link to an article, a blog post, or a webpage, and our AI will extract the key information and create a deck for you instantly.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-3xl mx-auto mb-20">
        <div className="bg-bgDark2/40 border border-white/10 rounded-3xl p-2 backdrop-blur-xl shadow-2xl relative group">
           <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <div className="p-4">
              <UrlGenerateForm 
                isPending={createPresentationFromUrl.isPending}
                onSubmit={(data) => createPresentationFromUrl.mutate(data)}
              />
           </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-secondaryText uppercase tracking-widest font-bold">
           <div className="flex items-center gap-2">
              <div className="size-1 rounded-full bg-indigo-400" />
              Articles
           </div>
           <div className="flex items-center gap-2">
              <div className="size-1 rounded-full bg-indigo-400" />
              Blog Posts
           </div>
           <div className="flex items-center gap-2">
              <div className="size-1 rounded-full bg-indigo-400" />
              Wiki Pages
           </div>
           <div className="flex items-center gap-2">
              <div className="size-1 rounded-full bg-indigo-400" />
              Documentation
           </div>
        </div>
      </div>

      {/* How it works */}
      <section className="mb-24">
        <div className="flex items-center gap-3 mb-10">
           <div className="h-8 w-8 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg shadow-sm">
              <Zap className="size-4 text-yellow-400" />
           </div>
           <h2 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest text-xs font-black opacity-50">How it works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard 
            number="01"
            title="Paste URL"
            description="Copy the link of any webpage or article you want to summarize and paste it above."
            icon={<Search className="size-6 text-indigo-400" />}
          />
          <StepCard 
            number="02"
            title="AI Extraction"
            description="Our specialized AI engine scrapes the content, identifies key insights, and filters out noise."
            icon={<Sparkles className="size-6 text-purple-400" />}
          />
          <StepCard 
            number="03"
            title="Generate Deck"
            description="We automatically create a structured, beautiful presentation with optimized layouts and styles."
            icon={<ArrowRight className="size-6 text-emerald-400" />}
          />
        </div>
      </section>

      {/* Recent Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg">
                <Clock className="size-4 text-indigo-400" />
             </div>
             <h2 className="text-xl font-bold text-white tracking-tight">Recent Web Conversions</h2>
          </div>
        </div>
        
        <div className="bg-bgDark2/20 rounded-3xl border border-white/5 p-8">
           <PresentationHistory 
             presentations={webPresentations} 
             isPending={listPending} 
           />
        </div>
      </section>

    </div>
  )
}

function StepCard({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-bgDark2/30 border border-white/5 rounded-3xl p-8 hover:border-indigo-500/20 transition-all hover:-translate-y-1 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 text-6xl font-black text-white/5 group-hover:text-indigo-500/10 transition-colors -mr-4 -mt-4">
           {number}
      </div>
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30">
           {icon}
        </div>
      </div>
      <h3 className="text-lg font-bold text-white mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-secondaryText leading-relaxed relative z-10">
        {description}
      </p>
    </div>
  )
}
