import { getSession } from '@/lib/auth.functions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
  presentationThumbnailUrl,
  useFullscreen,
  usePresentationDetail,
} from '#/features/presentations'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { Save, Trash2 } from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { SlideshowModal } from '#/features/presentations/components/slideshow-modal'
import { convertToEditable } from '#/features/presentations/actions/import-actions'
import { exportToPptx } from '#/features/presentations/lib/export-pptx'
import { exportToPdf } from '#/features/presentations/lib/export-pdf'
import { exportToGoogleSlidesAction } from '#/features/presentations/actions/export-actions'
import { PricingModal } from '#/components/dashboard/PricingModal'
import { RefreshCw, Plus } from 'lucide-react'
import { createSlide } from '#/features/presentations/actions/slide-mutations'

// Editor shell components
import { EditorLayout, EditorPanelRow } from '#/components/editor/EditorLayout'
import { EditorTopbar } from '#/components/editor/EditorTopbar'
import { SlidePreviewList } from '#/components/editor/SlidePreviewList'
import { SlideCanvas } from '#/components/editor/SlideCanvas'
import { AIChatPanel } from '#/components/editor/AIChatPanel'
import { ExportProgressOverlay } from '#/components/editor/ExportProgressOverlay'
import { LoadingScreen } from '#/components/ui/LoadingScreen'

import { ShareModal } from '#/components/editor/ShareModal'

export const Route = createFileRoute('/presentations/$presentationId')({
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
  component: PresentationDetailPage,
})

function PresentationDetailPage() {
  const { presentationId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportType, setExportType] = useState<'PDF' | 'PPTX' | 'GOOGLE_SLIDES'>('PPTX')
  const [exportComplete, setExportComplete] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [slideIdToDelete, setSlideIdToDelete] = useState<string | null>(null)

  const {
    query,
    slides,
    isGenerating,
    updatedLabel,
    form,
    setForm,
    updateMut,
    regenerateMut,
    deleteMut,
  } = usePresentationDetail(presentationId, {
    onDeleted: () => navigate({ to: '/' }),
  })

  const createMut = useMutation({
    mutationFn: () => createSlide({ data: { presentationId, order: activeSlideIndex + 1 } }),
    onMutate: async () => {
      toast.loading('Creating your slide...', { id: 'slide-create' })
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: presentationQueryKeys.detail(presentationId) })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(presentationQueryKeys.detail(presentationId))

      // Optimistically update to the new value
      if (previousData) {
        const newSlide = {
          id: 'temp-' + Math.random(),
          order: activeSlideIndex + 1,
          title: 'New Slide',
          content: 'Start typing here...',
          layoutType: 'title-content',
          imageUrl: null,
          updatedAt: new Date().toISOString(),
        }

        const newSlides = [...(previousData as any).slides]
        // Shift existing slides
        newSlides.forEach(s => {
          if (s.order >= activeSlideIndex + 1) s.order++
        })
        newSlides.splice(activeSlideIndex + 1, 0, newSlide)

        queryClient.setQueryData(presentationQueryKeys.detail(presentationId), {
          ...previousData as any,
          slides: newSlides
        })
        
        setActiveSlideIndex(activeSlideIndex + 1)
      }

      return { previousData }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(presentationQueryKeys.detail(presentationId), context?.previousData)
      toast.error('Failed to create slide', { id: 'slide-create' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.detail(presentationId) })
    },
    onSuccess: () => {
      toast.success('New slide created', { id: 'slide-create' })
    }
  })

  const globalDeleteMut = useMutation({
    mutationFn: (slideId: string) => deleteSlide({ data: { slideId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.detail(presentationId) })
      toast.success('Slide deleted')
      setSlideIdToDelete(null)
    },
    onError: (err: any) => toast.error(err.message || 'Delete failed')
  })

  // Clear AI editing state only after the query has finished refetching
  useEffect(() => {
    if (editingSlideId && !query.isFetching) {
      const timer = setTimeout(() => setEditingSlideId(null), 500) // Small buffer for render
      return () => clearTimeout(timer)
    }
  }, [editingSlideId, query.isFetching])

  const { isFullscreen, toggleFullscreen } = useFullscreen('slide-preview-container')

  const data = query.data
  const isImported = data?.contentType === 'pptx' || data?.contentType === 'pdf'


  const handleExportGoogleSlides = useCallback(async () => {
    if (slides.length === 0) return
    setIsExporting(true)
    setExportProgress(0)
    setExportType('GOOGLE_SLIDES')
    setExportComplete(false)

    // Simulate progress while waiting for the server action
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) return prev
        return prev + 5
      })
    }, 500)

    try {
      const result = await exportToGoogleSlidesAction({
        data: { presentationId },
      })
      
      clearInterval(interval)
      setExportProgress(100)
      setExportComplete(true)

      toast.success('Successfully exported to Google Slides!', {
        description: 'Your presentation is ready.',
        action: {
          label: 'Open Slides',
          onClick: () => window.open(result.url, '_blank'),
        },
      })
      
      // Keep overlay for a moment after completion
      setTimeout(() => {
        setIsExporting(false)
        setExportComplete(false)
      }, 2000)
    } catch (e) {
      clearInterval(interval)
      setIsExporting(false)
      toast.error(e instanceof Error ? e.message : 'Export failed')
    }
  }, [presentationId, slides])

  const handleExportPptx = useCallback(async () => {
    const data = query.data
    if (!data || slides.length === 0) return
    setIsExporting(true)
    setExportProgress(0)
    setExportType('PPTX')
    setExportComplete(false)
    try {
      const filename = await exportToPptx({ 
        title: data.title, 
        slides,
        onProgress: (p) => setExportProgress(p)
      })
      setExportComplete(true)
      setTimeout(() => setIsExporting(false), 2000)
      toast.success(`Exported as ${filename}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
      setIsExporting(false)
    }
  }, [query.data, slides])

  const handleExportPdf = useCallback(async () => {
    const data = query.data
    if (!data || slides.length === 0) return

    setIsExporting(true)
    setExportProgress(0)
    setExportType('PDF')
    setExportComplete(false)
    try {
      const filename = await exportToPdf({ 
        title: data.title, 
        slides,
        onProgress: (p) => setExportProgress(p)
      })
      setExportComplete(true)
      setTimeout(() => setIsExporting(false), 2000)
      toast.success(`Exported as ${filename}`)
    } catch (e) {
      console.error(e)
      toast.error('PDF export failed. Make sure all slides are visible.')
      setIsExporting(false)
    }
  }, [query.data, slides])

  // ── Loading state ────────────────────────────────────────────────────────
  if (query.isPending) {
    return <LoadingScreen message="Loading presentation…" />
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (query.isError) {
    return (
      <EditorLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-red-400">
            {query.error instanceof Error ? query.error.message : 'Something went wrong'}
          </p>
          <Link to="/" className="text-sm text-secondaryText underline">
            Back to dashboard
          </Link>
        </div>
      </EditorLayout>
    )
  }

  const activeSlide = slides.at(activeSlideIndex)

  if (data && slides.length === 0 && isImported && data.status === 'PROCESSING') {
    return <LoadingScreen message="Building your editable slides…" />
  }

  return (
    <EditorLayout>
      {/* ── Topbar ── */}
      <EditorTopbar
        user={user as any}
        title={data.title}
        updatedLabel={updatedLabel}
        status={data.status}
        scrapeStatus={data.scrapeStatus}
        contentType={data.contentType}
        isGenerating={isGenerating}
        isExporting={isExporting}
        hasSlides={slides.length > 0}
        updatePending={updateMut.isPending}
        formValid={!!form.title.trim() && !!form.prompt.trim()}
        regeneratePending={regenerateMut.isPending}
        deletePending={deleteMut.isPending}
        showSettings={showSettings}
        onSave={() => updateMut.mutate()}
        onRegenerate={() => regenerateMut.mutate()}
        onExport={handleExportPptx}
        onExportPdf={handleExportPdf}
        onExportGoogleSlides={handleExportGoogleSlides}
        onSlideshow={() => setShowSlideshow(true)}
        onToggleSettings={() => setShowSettings((s) => !s)}
        onUpgrade={() => setIsPricingModalOpen(true)}
        onShare={() => setShowShareModal(true)}
      />

      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
      />

      {/* ── Settings panel (collapsible, full-width strip) ── */}
      {showSettings && (
        <div className="border-b border-mainBorderDarker bg-bgDark1/60 backdrop-blur-sm px-6 py-5">
          <div className="mx-auto max-w-4xl space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pres-title" className="text-xs font-bold text-secondaryText uppercase tracking-wider">
                  Title
                </Label>
                <input
                  id="pres-title"
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  className="form-input h-10 text-sm bg-bgDark1/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-secondaryText uppercase tracking-wider">Prompt</Label>
                <Textarea
                  value={form.prompt}
                  onChange={(e) => setForm((s) => ({ ...s, prompt: e.target.value }))}
                  className="min-h-[80px] text-sm bg-bgDark1/50 border-mainBorderSubtler rounded-xl resize-y text-primaryText placeholder:text-secondaryText focus:border-primaryColor focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-secondaryText uppercase tracking-wider">
                  Slides: {form.slideCount}
                </Label>
                <Slider
                  value={[form.slideCount]}
                  onValueChange={([v]) => setForm((s) => ({ ...s, slideCount: v }))}
                  min={3} max={20} step={1} className="py-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-secondaryText uppercase tracking-wider">Style</Label>
                <Select value={form.style} onValueChange={(value) => setForm((s) => ({ ...s, style: value as any }))}>
                  <SelectTrigger className="bg-bgDark1/50 border-mainBorderSubtler rounded-xl text-primaryText">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bgDark1 border-mainBorderDarker">
                    {SLIDE_STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-secondaryText uppercase tracking-wider">Tone</Label>
                <Select value={form.tone} onValueChange={(value) => setForm((s) => ({ ...s, tone: value as any }))}>
                  <SelectTrigger className="bg-bgDark1/50 border-mainBorderSubtler rounded-xl text-primaryText">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bgDark1 border-mainBorderDarker">
                    {TONE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-secondaryText uppercase tracking-wider">Layout</Label>
                <Select value={form.layout} onValueChange={(value) => setForm((s) => ({ ...s, layout: value as any }))}>
                  <SelectTrigger className="bg-bgDark1/50 border-mainBorderSubtler rounded-xl text-primaryText">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bgDark1 border-mainBorderDarker">
                    {LAYOUT_OPTIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={deleteMut.isPending}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Presentation
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-bgDark1 border-mainBorderDarker">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-primaryText">Delete presentation?</AlertDialogTitle>
                    <AlertDialogDescription className="text-secondaryText">
                      This cannot be undone. All slides will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-bgDark2 border-mainBorderDarker text-primaryText hover:bg-bgDark3">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => deleteMut.mutate()}
                    >
                      {deleteMut.isPending ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <button
                disabled={updateMut.isPending || !form.title.trim() || !form.prompt.trim()}
                onClick={() => updateMut.mutate()}
                className="contained-button h-8 px-4 text-xs gap-1.5 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {updateMut.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorPanelRow>
        <SlidePreviewList
          slides={slides}
          activeIndex={activeSlideIndex}
          isGenerating={isGenerating}
          isImported={isImported}
          onSelect={setActiveSlideIndex}
          onRegenerate={() => regenerateMut.mutate()}
          onCreate={() => createMut.mutate()}
          onDelete={setSlideIdToDelete}
          onRename={(id) => {
            const el = document.getElementById(`slide-title-${id}`)
            el?.focus()
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
          regeneratePending={regenerateMut.isPending}
          template={data.template as any}
        />

        <SlideCanvas
          presentationId={presentationId}
          slides={slides}
          activeIndex={activeSlideIndex}
          activeSlide={activeSlide}
          isGenerating={isGenerating}
          isFullscreen={isFullscreen}
          contentType={data.contentType}
          scrapeStatus={data.scrapeStatus}
          template={data.template as any}
          isImported={isImported}
          onPrev={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
          onNext={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
          onFullscreen={toggleFullscreen}
          onRegenerate={() => regenerateMut.mutate()}
          regeneratePending={regenerateMut.isPending}
          editingSlideId={editingSlideId}
          onSelect={setActiveSlideIndex}
        />

        <AIChatPanel 
          slideId={activeSlide?.id} 
          presentationId={presentationId} 
          slides={slides}
          onEditingSlideIdChange={setEditingSlideId}
        />
      </EditorPanelRow>

      {/* Global Delete Confirmation for Sidebar */}
      <AlertDialog open={!!slideIdToDelete} onOpenChange={(open) => !open && setSlideIdToDelete(null)}>
        <AlertDialogContent className="bg-bgDark1 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete this slide?</AlertDialogTitle>
            <AlertDialogDescription className="text-secondaryText text-sm">
              This action cannot be undone. All content on this slide will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => slideIdToDelete && globalDeleteMut.mutate(slideIdToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              {globalDeleteMut.isPending ? 'Deleting...' : 'Delete Slide'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Slideshow modal (unchanged) ── */}
      {showSlideshow && (
        <SlideshowModal
          slides={slides}
          initialIndex={activeSlideIndex}
          onClose={() => setShowSlideshow(false)}
          template={data.template}
        />
      )}

      {isExporting && (
        <ExportProgressOverlay 
          progress={exportProgress} 
          type={exportType}
          isComplete={exportComplete}
        />
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        presentationTitle={data.title}
        presentationId={presentationId}
      />
    </EditorLayout>
  )
}
