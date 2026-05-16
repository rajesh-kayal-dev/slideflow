import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { getSession } from '@/lib/auth.functions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { prisma } from '#/db'
import { requirePresentationUserId } from '#/features/presentations/lib/server-helpers'
import { createServerFn } from '@tanstack/react-start'
import { s3Client } from '#/lib/s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { DashboardLayout } from '#/components/dashboard/DashboardLayout'
import { Button } from '#/components/ui/button'
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Maximize2,
  Share2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Play,
  Settings,
  Plus,
  Type,
  Layout,
  ChevronDown,
  MoreVertical,
  Loader2
} from 'lucide-react'
import { convertToEditable } from '#/features/presentations/actions/import-actions'
import { SlidePreview } from '#/features/presentations/components/slide-preview'
import { toast } from 'sonner'
import React, { useState } from 'react'

// 1. Fetch document details and signed view URL
const getDocumentDetails = createServerFn({ method: 'GET' })
  .inputValidator((d: { presentationId: string }) => d)
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const presentation = await prisma.presentation.findUnique({
      where: { id: data.presentationId, userId },
      include: {
        slides: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!presentation) throw new Error('Document not found')
    if (!presentation.sourceUrl) throw new Error('Document source missing')

    // Generate a signed URL for viewing the file from S3
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET!,
      Key: presentation.sourceUrl,
    })

    const viewUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    
    // Generate signed URL for thumbnail
    let signedThumbnail = presentation.thumbnailUrl
    if (presentation.thumbnailUrl && !presentation.thumbnailUrl.startsWith('http')) {
       const thumbCommand = new GetObjectCommand({
         Bucket: process.env.AWS_BUCKET!,
         Key: presentation.thumbnailUrl,
       })
       signedThumbnail = await getSignedUrl(s3Client, thumbCommand, { expiresIn: 3600 })
    }

    return { presentation, viewUrl, signedThumbnail }
  })

export const Route = createFileRoute('/viewer/$presentationId')({
  beforeLoad: async ({ location, context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData({
      queryKey: ['session'],
      queryFn: () => getSession(),
      staleTime: 1000 * 60 * 5,
    })

    if (!session?.user) {
      throw redirect({ to: '/', search: { auth: 'login', redirect: location.href } })
    }
    return { user: session.user }
  },
  component: DocumentViewerPage,
})

function DocumentViewerPage() {
  const { presentationId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeSlide, setActiveSlide] = useState(0)
  
  const { data, isPending, error } = useQuery({
    queryKey: ['document', presentationId],
    queryFn: () => getDocumentDetails({ data: { presentationId } })
  })

  const convertMut = useMutation({
    mutationFn: () => convertToEditable({ data: { presentationId } }),
    onSuccess: () => {
      toast.success('Successfully converted to editable slides!')
      queryClient.invalidateQueries({ queryKey: ['document', presentationId] })
      navigate({ to: '/presentations/$presentationId', params: { presentationId } })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Conversion failed')
    }
  })

  if (isPending) return (
    <DashboardLayout>
      <div className="flex h-full items-center justify-center text-white">
        <Loader2 className="animate-spin h-8 w-8 text-[#4F46E5]" />
      </div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout>
      <div className="flex h-full flex-col items-center justify-center text-white gap-4">
        <p className="text-red-400">Failed to load document</p>
        <Button onClick={() => navigate({ to: '/import' })}>Go Back</Button>
      </div>
    </DashboardLayout>
  )

  const { presentation, viewUrl, signedThumbnail } = data
  
  const currentSlideData = presentation.slides[activeSlide] || {
    title: presentation.title,
    content: 'No slide content detected.',
    order: 0
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-[#0F0F0F]">
        {/* Top Header Bar */}
        <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate({ to: '/' })}
              className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-secondaryText hover:text-white transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#4F46E5]/20 flex items-center justify-center text-[#4F46E5]">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <h1 className="text-xs font-bold text-white truncate max-w-[200px]">
                {presentation.title}
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                {presentation.contentType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <Button 
                variant="ghost" 
                size="sm" 
                className="text-secondaryText hover:text-white gap-2 rounded-lg h-8 text-[11px] font-bold"
                onClick={() => convertMut.mutate()}
                disabled={convertMut.isPending}
             >
               {convertMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-amber-400" />}
               {convertMut.isPending ? 'Converting...' : 'Convert to AI Slides'}
             </Button>
             <div className="h-4 w-px bg-white/10 mx-1" />
             <Button 
               variant="ghost"
               size="sm"
               className="text-secondaryText hover:text-white gap-2 rounded-lg h-8 text-[11px] font-bold"
               onClick={() => window.open(viewUrl, '_blank')}
             >
               <Download className="h-3 w-3" />
               Download
             </Button>
             <Button 
               className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white rounded-lg gap-2 font-bold h-8 px-4 text-[11px]"
               onClick={() => {}}
             >
               <Share2 className="h-3 w-3" />
               Share
             </Button>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
           
           {/* Sidebar - Slide Navigation */}
           <div className="w-64 border-r border-[#E5E7EB] bg-[#F9FAFB] flex flex-col shrink-0">
              <div className="p-4 border-b border-[#E5E7EB] space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                       <div className="h-6 w-6 rounded-md bg-[#4F46E5] flex items-center justify-center text-white"><Layout className="h-3.5 w-3.5" /></div>
                       <div className="h-6 w-6 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center text-[#4B5563]"><Settings className="h-3.5 w-3.5" /></div>
                    </div>
                    <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors"><MoreVertical className="h-3.5 w-3.5" /></button>
                 </div>
                 <Button className="w-full bg-white hover:bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB] rounded-xl h-10 font-bold gap-2 shadow-sm justify-start px-4">
                    <Plus className="h-4 w-4 text-[#4F46E5]" />
                    New
                    <ChevronDown className="h-3.5 w-3.5 ml-auto text-[#9CA3AF]" />
                 </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                 <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Slides ({presentation.slideCount})</span>
                 </div>
                 {presentation.slides.map((s: any, i: number) => (
                    <div 
                      key={s.id}
                      className={`group relative aspect-video rounded-xl border-2 transition-all cursor-pointer overflow-hidden shadow-sm ${
                         activeSlide === i ? 'border-[#4F46E5] bg-white ring-4 ring-[#4F46E5]/10' : 'border-white/80 bg-white hover:border-[#4F46E5]/30'
                      }`}
                      onClick={() => setActiveSlide(i)}
                    >
                       {/* Mini Slide Content Preview */}
                       <div className="w-full h-full p-2 flex flex-col gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <div className="h-2 w-1/2 bg-[#E5E7EB] rounded-full" />
                          <div className="h-1 w-full bg-[#F3F4F6] rounded-full" />
                          <div className="h-1 w-2/3 bg-[#F3F4F6] rounded-full" />
                       </div>

                       <div className="absolute inset-0 flex items-center justify-center p-2 text-center bg-white/40">
                          <span className="text-[8px] font-black text-[#374151] group-hover:text-[#111827] line-clamp-2 uppercase tracking-tighter leading-none">{s.title}</span>
                       </div>
                       <div className="absolute bottom-2 right-2 h-5 w-5 rounded-lg bg-white shadow-md border border-[#E5E7EB] flex items-center justify-center">
                          <span className="text-[9px] font-black text-[#4F46E5]">{i + 1}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Center Canvas - NATIVE RENDERER (LIGHT MODE) */}
           <div className="flex-1 bg-[#F3F4F6] p-12 flex flex-col items-center overflow-auto custom-scrollbar gap-12 pb-40">
              <div className="w-full max-w-5xl aspect-video bg-white rounded-[1.5rem] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative group">
                 
                 {/* Internal Toolbar (like screenshot) */}
                 <div className="absolute top-4 left-4 z-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-[#E5E7EB] shadow-xl flex items-center gap-1">
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-[#4B5563] hover:bg-[#F3F4F6]"><Sparkles className="h-3.5 w-3.5" /></Button>
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-[#4B5563] hover:bg-[#F3F4F6]"><Type className="h-3.5 w-3.5" /></Button>
                    </div>
                 </div>

                 <SlidePreview 
                   slide={currentSlideData} 
                   isFullscreen={false} 
                   template={{
                      config: {
                         colors: {
                            primary: '#111827',
                            secondary: '#4B5563',
                            background: '#ffffff',
                            text: '#111827',
                            accent: '#4F46E5'
                         },
                         typography: {
                            heading: 'Inter, sans-serif',
                            body: 'Inter, sans-serif',
                            sizes: { heading: '2.5rem', body: '1.125rem' }
                         },
                         layout: { spacing: '3rem', borderRadius: '0' }
                      }
                   }} 
                 />
                 
                 {/* Fullscreen control overlay */}
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      className="h-9 w-9 rounded-xl bg-white/90 backdrop-blur-md border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] shadow-xl"
                      onClick={() => {}}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
              
              {/* Controls (Floating Style) */}
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-3xl bg-white/90 backdrop-blur-xl border border-[#E5E7EB] shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-50">
                 <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-2xl text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                      disabled={activeSlide === 0}
                      onClick={() => setActiveSlide(s => s - 1)}
                    >
                       <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="px-6 py-2 rounded-2xl bg-[#F3F4F6] text-xs font-black text-[#111827] tracking-widest uppercase">
                       {activeSlide + 1} / {presentation.slideCount}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-2xl text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                      disabled={activeSlide === (presentation.slideCount - 1)}
                      onClick={() => setActiveSlide(s => s + 1)}
                    >
                       <ChevronRight className="h-5 w-5" />
                    </Button>
                 </div>
                 <div className="h-6 w-px bg-[#E5E7EB] mx-2" />
                 <Button className="h-11 px-8 rounded-2xl bg-[#111827] text-white font-black flex items-center gap-3 hover:bg-[#1F2937] shadow-xl shadow-[#111827]/20 transition-all transform active:scale-95">
                    <Play className="h-4 w-4 fill-current" />
                    Present
                 </Button>
              </div>
           </div>
        </div>

        {/* Metadata Footer */}
        <div className="h-10 border-t border-[#E5E7EB] bg-white flex items-center justify-between px-6 shrink-0 shadow-[0_-1px_0_rgba(0,0,0,0.02)]">
           <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-[#9CA3AF]">
              <div className="flex items-center gap-2">
                 <span className="text-[#D1D5DB]">Status:</span>
                 <span className="text-[#10B981]">Native View Enabled</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[#D1D5DB]">Uploaded:</span>
                 <span className="text-[#4B5563]">{new Date(presentation.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[#D1D5DB]">Format:</span>
                 <span className="text-[#4B5563]">{presentation.contentType?.toUpperCase()}</span>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[9px] text-[#9CA3AF] font-bold italic tracking-tight">
                 Experience native, high-fidelity rendering. Click "Convert to AI Slides" for full editing power.
              </span>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
