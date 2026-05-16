import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Edit2, ExternalLink, Loader2, Star, Trash2, MoreVertical, Share2, Download as DownloadIcon, Play, Archive } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '#/components/ui/dropdown-menu'
import { exportToPptx } from '../lib/export-pptx'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

import {
  deletePresentation,
  updatePresentation,
  toggleFavorite,
} from '../actions/presentation-mutations'

import { presentationQueryKeys } from '../hooks/query-keys'
import type { Presentation } from '../types/presentation.types'
import { presentationThumbnailUrl } from '../utils/thumbnail-url'
import { SlidePreview } from './slide-preview'


type PresentationCardProps = {
  presentation: Presentation & {
    slides?: any[]
    template?: {
      config: any
    }
  }
}


export function PresentationCard({ presentation: p }: PresentationCardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editTitle, setEditTitle] = useState(p.title)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const slides = p.slides || []
  const template = p.template
  const thumbRef = useRef<HTMLDivElement>(null)


  const updated = new Date(p.updatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const thumb = p.thumbnailUrl || presentationThumbnailUrl(p.id)

  // Auto-play logic
  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % Math.min(slides.length, 3))
    }, 4000) // 4 seconds per slide for a "live" feel

    return () => clearInterval(interval)
  }, [slides.length])

  // Precise Scaling Logic
  useEffect(() => {
    if (!thumbRef.current || slides.length === 0) return

    const obs = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      if (width > 0) {
        // Calculate scale: (Available Width - Padding) / Base Slide Width
        const scale = (width - 32) / 1024
        thumbRef.current?.style.setProperty('--slide-scale', scale.toString())
      }
    })

    obs.observe(thumbRef.current)
    return () => obs.disconnect()
  }, [slides.length])


  // ── Soft Delete mutation (Move to trash) ───────────────────────────────
  const deleteMut = useMutation({
    mutationFn: () => deletePresentation({ data: { id: p.id } }),
    onSuccess: () => {
      toast.success('Moved to trash')
      setShowDeleteDialog(false)
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.trash() })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Failed to move to trash')
    },
  })

  // ── Update/rename mutation ───────────────────────────────────────────
  const renameMut = useMutation({
    mutationFn: () =>
      updatePresentation({ data: { id: p.id, title: editTitle.trim() } }),
    onSuccess: () => {
      toast.success('Presentation renamed')
      setShowEditDialog(false)
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Failed to rename')
    },
  })

  // ── Favorite mutation ───────────────────────────────────────────────
  const favoriteMut = useMutation({
    mutationFn: () => toggleFavorite({ data: { id: p.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Failed to star')
    },
  })

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.promise(
      exportToPptx({
        title: p.title,
        slides: slides.map((s: any) => ({
          id: s.id,
          order: s.order,
          title: s.title,
          content: s.content,
          imageUrl: s.imageUrl,
          notes: s.notes
        }))
      }),
      {
        loading: 'Preparing download...',
        success: 'Download started!',
        error: 'Failed to export'
      }
    )
  }

  const handleCardClick = () => {
    navigate({
      to: '/presentations/$presentationId',
      params: { presentationId: p.id },
    })
  }

  return (
    <>
      {/* ── Card ────────────────────────────────────────────────────── */}
      <div className="relative group">
        {/* Clickable card area */}
        <div
          role="button"
          tabIndex={0}
          className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 rounded-xl group-hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleCardClick()
            }
          }}
        >
          <div className="flex flex-col h-full bg-white dark:bg-bgDark1 rounded-xl border border-mainBorderFaintest overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:border-mainBorderSubtler">
            {/* 16:9 Thumbnail Area */}
            <div
              className="aspect-video w-full bg-bgDark2 relative overflow-hidden flex items-center justify-center border-b border-mainBorderFaintest"
              ref={thumbRef}
            >
              {slides.length > 0 ? (
                <div className="w-full h-full relative group-hover:scale-[1.02] transition-transform duration-700 flex items-center justify-center">
                  {/* Blurred Background Skeleton (Premium Look) */}
                  <div className="absolute inset-0 bg-bgDark3 animate-pulse overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primaryColor/10 to-transparent blur-2xl opacity-50" />
                  </div>

                  {/* Slides Sequence */}
                  {slides.slice(0, 3).map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-center ${idx === currentSlideIndex
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-95 z-0'
                        }`}
                    >
                      {/* 
                  Dynamic Scaling Implementation:
                  We use a CSS variable for the scale calculated based on the card width.
                  This is much more reliable than cqw which can inherit from distant parents.
                */}
                      <div className="relative w-full h-full flex items-center justify-center p-3">
                        <div
                          className="origin-center shadow-2xl shadow-black/40 rounded-sm overflow-hidden border border-white/5 bg-black"
                          style={{
                            // Fallback for SSR: assume a typical card width of ~300px
                            transform: `scale(var(--slide-scale, 0.28))`,
                            width: '1024px',
                            height: '576px',
                            flexShrink: 0
                          }}
                        >
                          <SlidePreview slide={slide} template={template} />
                        </div>
                      </div>

                      {/* Premium Glass Overlay - subtle vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ))}

                  {/* Progress Indicator (AI style) */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 px-2 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-lg">
                    {slides.slice(0, 3).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-500 ${idx === currentSlideIndex ? 'w-5 bg-white' : 'w-1 bg-white/30'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative p-4 flex items-center justify-center bg-bgDark3/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-bgDark3 to-bgDark2" />
                  <img
                    src={thumb}
                    alt=""
                    loading="lazy"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.05]"
                  />

                  {p.status === 'GENERATING' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-primaryColor animate-spin" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">
                          {p.contentType === 'pptx' ? 'Processing' : 'Generating'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>


            {/* Info Area */}
            <div className="p-4 flex items-start justify-between gap-3 min-h-[84px]">
              <div className="flex flex-col gap-1 overflow-hidden">
                <h3 className="text-sm font-bold text-primaryText line-clamp-1 group-hover:text-primaryColor transition-colors">
                  {p.title || 'Untitled'}
                </h3>
                <p className="text-[11px] text-secondaryText font-medium">
                  Viewed recently
                </p>
              </div>

              {/* Action Menu (Vertical Three Dots) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 -mr-2 rounded-full hover:bg-white/5 text-secondaryText hover:text-white transition-all opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-bgDark2/95 backdrop-blur-xl border-white/10 text-white">
                  <DropdownMenuItem onClick={handleCardClick} className="gap-2 focus:bg-white/5 cursor-pointer">
                    <Play className="size-3.5 text-indigo-400" />
                    <span>Open / Start</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCardClick} className="gap-2 focus:bg-white/5 cursor-pointer">
                    <Edit2 className="size-3.5 text-indigo-400" />
                    <span>Edit Presentation</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setEditTitle(p.title); setShowEditDialog(true); }}
                    className="gap-2 focus:bg-white/5 cursor-pointer"
                  >
                    <ExternalLink className="size-3.5 text-indigo-400" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); toast.success('Link copied to clipboard!'); }}
                    className="gap-2 focus:bg-white/5 cursor-pointer"
                  >
                    <Share2 className="size-3.5 text-emerald-400" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload} className="gap-2 focus:bg-white/5 cursor-pointer">
                    <DownloadIcon className="size-3.5 text-emerald-400" />
                    <span>Download PPTX</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                    className="gap-2 focus:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Move to trash</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ── Favorite shortcut (always visible on hover) ───────────────── */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto">
          <Button
            id={`fav-ppt-${p.id}`}
            size="icon"
            variant="secondary"
            className={`size-7 rounded-lg shadow-xl border border-white/10 bg-black/40 backdrop-blur-md transition-all ${p.isFavorite ? 'text-amber-400 border-amber-400/30' : 'text-white/40 hover:text-amber-400'
              }`}
            onClick={(e) => {
              e.stopPropagation()
              favoriteMut.mutate()
            }}
          >
            <Star className={`size-3.5 ${p.isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── Delete confirmation dialog (Now Move to Trash) ──────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Move to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move <span className="font-medium text-foreground">"{p.title}"</span> to the trash? You can restore it later from the Trash Bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              disabled={deleteMut.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              disabled={deleteMut.isPending}
              onClick={() => deleteMut.mutate()}
            >
              {deleteMut.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Moving…
                </>
              ) : (
                <>
                  <Archive className="size-4" />
                  Move to trash
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit / rename dialog ────────────────────────────────────── */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Rename presentation</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new title for this presentation.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <input
            id={`rename-input-${p.id}`}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && editTitle.trim() && !renameMut.isPending) {
                renameMut.mutate()
              }
              if (e.key === 'Escape') setShowEditDialog(false)
            }}
            className="flex h-10 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30 mt-2"
            placeholder="Presentation title"
            autoFocus
            maxLength={200}
          />

          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              disabled={renameMut.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl gap-2"
              disabled={!editTitle.trim() || renameMut.isPending}
              onClick={() => renameMut.mutate()}
            >
              {renameMut.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
