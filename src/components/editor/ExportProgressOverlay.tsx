import React from 'react'
import { Download, FileText, CheckCircle2 } from 'lucide-react'

interface ExportProgressOverlayProps {
  progress: number
  isComplete: boolean
  type: 'PDF' | 'PPTX' | 'GOOGLE_SLIDES'
}

export function ExportProgressOverlay({ progress, isComplete, type }: ExportProgressOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-md p-8 bg-bgDark1 border border-white/10 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 size-48 bg-indigo-500/10 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 size-48 bg-indigo-500/10 blur-[100px] animate-pulse" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="size-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
            {isComplete ? (
              <CheckCircle2 className="size-10 text-green-400 animate-in zoom-in duration-300" />
            ) : (
              <div className="relative">
                <Download className="size-10 text-indigo-400 animate-bounce" />
                <div className="absolute inset-0 blur-lg bg-indigo-400/20" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-white tracking-tight">
              {isComplete ? 'Export Complete!' : 
               type === 'GOOGLE_SLIDES' ? 'Sending to Google Slides' : 
               `Preparing Your ${type}`}
            </h3>
            <p className="text-secondaryText text-xs uppercase tracking-widest font-black opacity-60">
              {isComplete ? 'Your file is ready' : 'High-fidelity generation in progress'}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
            <span>{isComplete ? '100% Finalized' : 'Processing Slides'}</span>
            <span className="text-indigo-400">{progress}%</span>
          </div>
          
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_100%] animate-shimmer rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${progress > 25 ? 'bg-indigo-400' : 'bg-white/10'} transition-colors duration-300`} />
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Capturing</span>
           </div>
           <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${progress > 60 ? 'bg-indigo-400' : 'bg-white/10'} transition-colors duration-300`} />
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Optimizing</span>
           </div>
           <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${progress === 100 ? 'bg-indigo-400' : 'bg-white/10'} transition-colors duration-300`} />
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Finishing</span>
           </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}} />
    </div>
  )
}
