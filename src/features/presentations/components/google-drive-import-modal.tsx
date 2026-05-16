import React, { useState } from 'react'
import { X, Cloud, Link2, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createPresentation } from '#/features/presentations/actions/presentation-mutations'
import { toast } from 'sonner'

interface GoogleDriveImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GoogleDriveImportModal({ isOpen, onClose }: GoogleDriveImportModalProps) {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const importMut = useMutation({
    mutationFn: (googleId: string) => 
      createPresentation({ 
        data: { 
          prompt: 'Google Slides Import',
          googleTemplateId: googleId,
          slideCount: 0, // Not used for direct import
          style: 'Modern',
          tone: 'Professional',
          layout: 'Standard'
        } 
      }),
    onSuccess: (data) => {
      toast.success('Importing slides... this may take a moment.')
      queryClient.invalidateQueries({ queryKey: ['presentations'] })
      queryClient.invalidateQueries({ queryKey: ['import-history'] })
      onClose()
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: data.id }
      })
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to import slides')
    }
  })

  if (!isOpen) return null

  const handleImport = () => {
    if (!url.trim()) return

    // Extract ID from Google Slides URL
    // Format: https://docs.google.com/presentation/d/1A2B3C.../edit
    const match = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)
    if (!match || !match[1]) {
      toast.error('Invalid Google Slides URL. Please ensure it follows the format: https://docs.google.com/presentation/d/ID/edit')
      return
    }

    const googleId = match[1]
    importMut.mutate(googleId)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-xl bg-bgDark1 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-secondaryText hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="h-20 w-20 bg-[#4F46E5]/10 rounded-[2rem] flex items-center justify-center mb-6 border border-[#4F46E5]/20">
              <Cloud className="h-10 w-10 text-[#4F46E5]" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-3">Google Slides Import</h2>
            <p className="text-secondaryText max-w-sm text-sm leading-relaxed">
              Enter your Google Slides shareable URL to import it directly into SlideFlow.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-secondaryText group-focus-within:text-[#4F46E5] transition-colors">
                <Link2 className="h-5 w-5" />
              </div>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.google.com/presentation/d/..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-sm text-white placeholder:text-secondaryText focus:border-[#4F46E5]/50 focus:bg-[#4F46E5]/5 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
              />
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
              <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Permission Required</h4>
                <p className="text-[11px] text-secondaryText leading-relaxed">
                  Make sure the presentation is set to <strong>"Anyone with the link"</strong> or share it with our service account for a successful import.
                </p>
              </div>
            </div>

            <button 
              onClick={handleImport}
              disabled={!url.trim() || importMut.isPending}
              className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:opacity-50 disabled:pointer-events-none text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#4F46E5]/20 active:scale-95"
            >
              {importMut.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Connect & Import
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          <p className="mt-8 text-[10px] text-secondaryText text-center font-bold uppercase tracking-[0.15em] opacity-40">
            Powered by Google Cloud API
          </p>
        </div>
      </div>
    </div>
  )
}
