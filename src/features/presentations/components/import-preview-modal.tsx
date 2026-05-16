import React, { useMemo } from 'react'
import { X, Check, Loader2, FileText, ChevronRight, Download, ImageIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Progress } from '#/components/ui/progress'

import type { ExtractedSlide } from '#/features/presentations/lib/pptx-parser'

interface ImportPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: () => void
  fileName: string
  fileType?: string
  fileBuffer?: ArrayBuffer | null
  selectedFile?: File | null
  slides: ExtractedSlide[]
  thumbnailUrl?: string | null
  uploadProgress: number
  isUploading: boolean
}

export function ImportPreviewModal({
  isOpen,
  onClose,
  onImport,
  fileName,
  fileType,
  fileBuffer,
  selectedFile,
  slides,
  thumbnailUrl,
  uploadProgress,
  isUploading
}: ImportPreviewModalProps) {
  if (!isOpen) return null

  // Create blob URL for PDF preview
  const pdfUrl = useMemo(() => {
    if (selectedFile && fileName.toLowerCase().endsWith('.pdf')) {
      return URL.createObjectURL(selectedFile)
    }
    return null
  }, [selectedFile, fileName, isOpen])

  // Cleanup on unmount or close
  React.useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  const isPdf = fileName.toLowerCase().endsWith('.pdf')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
      <div className="bg-bgDark1 border border-white/10 w-full max-w-5xl rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#4F46E5] flex items-center justify-center text-white shadow-xl shadow-[#4F46E5]/20">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-none mb-2 tracking-tight">Ready to Import</h2>
              <p className="text-sm text-secondaryText font-medium flex items-center gap-2">
                <span className="text-white/60">{fileName}</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{isPdf ? 'PDF Document' : `${slides.length} Slides Detected`}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="h-12 w-12 rounded-full hover:bg-white/5 flex items-center justify-center text-secondaryText hover:text-white transition-all transform active:scale-90"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Static Thumbnail Preview */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-black/20 flex flex-col items-center justify-center gap-8">
          <div className="w-full max-w-4xl flex flex-col">
            <div className="aspect-video bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] overflow-hidden relative group shadow-2xl">
              
              {/* PDF LIVE PREVIEW */}
              {isPdf && pdfUrl ? (
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : 
              /* THUMBNAIL IMAGE (PPTX) */
              thumbnailUrl ? (
                 <div className="w-full h-full flex items-center justify-center bg-black/40">
                    <img 
                      src={thumbnailUrl} 
                      alt="PPT Preview" 
                      className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-8 flex items-center gap-4">
                       <div className="h-10 px-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                          <span className="text-sm font-black text-white">{slides.length}</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Slides</p>
                          <p className="text-sm font-bold text-white">Cover Preview</p>
                       </div>
                    </div>
                 </div>
              ) : (
                /* FALLBACK */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-bgDark3/30">
                    <div className="h-24 w-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                        <FileText className="h-12 w-12 text-[#4F46E5]" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">{fileName}</h3>
                    <p className="text-sm text-secondaryText mb-8 max-w-md">
                        This document is ready to be imported. We've verified its structure and it's ready for your secure cloud storage.
                    </p>
                    <div className="flex gap-4">
                        <span className="px-5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                          Validated
                        </span>
                        <span className="px-5 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                          {isPdf ? 'PDF' : `${slides.length} Slides`}
                        </span>
                    </div>
                </div>
              )}
            </div>
            
            <p className="mt-10 text-center text-xs text-secondaryText leading-relaxed">
              We've extracted a high-quality thumbnail of your first slide. <br/>
              The original file will be stored securely in your private cloud bucket.
            </p>
          </div>
        </div>

        {/* Footer / Progress */}
        <div className="px-10 py-10 border-t border-white/5 bg-white/[0.02]">
          {isUploading ? (
            <div className="max-w-md mx-auto space-y-6">
              <div className="flex items-center justify-between text-xs font-black text-white uppercase tracking-[0.2em]">
                <span className="flex items-center gap-3">
                   <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" />
                   Uploading to secure cloud...
                </span>
                <span className="text-[#4F46E5]">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4F46E5] to-[#6485ff] transition-all duration-300 shadow-[0_0_20px_rgba(45,91,255,0.4)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-secondaryText">
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium italic">Static preview active</span>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="rounded-2xl px-8 h-14 text-secondaryText hover:text-white hover:bg-white/5 font-bold transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onImport}
                  className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white rounded-2xl px-10 h-14 font-black flex items-center gap-3 shadow-2xl shadow-[#4F46E5]/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <Download className="h-5 w-5" />
                  Import Presentation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
