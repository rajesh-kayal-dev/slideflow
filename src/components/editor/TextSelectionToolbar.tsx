import { Wand2, MessageSquare, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface TextSelectionToolbarProps {
  selectionRect: DOMRect | null
  selectedText: string
  onAskAI: (prompt: string) => void
  onClose: () => void
}

export function TextSelectionToolbar({ 
  selectionRect, 
  selectedText, 
  onAskAI,
  onClose 
}: TextSelectionToolbarProps) {
  const [isInputOpen, setIsInputOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)

  if (!selectionRect || !selectedText) return null

  // Calculate position (centered above the selection)
  const top = selectionRect.top + window.scrollY - 50
  const left = selectionRect.left + window.scrollX + selectionRect.width / 2

  return (
    <div 
      ref={toolbarRef}
      className="fixed z-[100] -translate-x-1/2 flex flex-col gap-2 transition-all duration-200 animate-in fade-in zoom-in slide-in-from-top-2"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      {!isInputOpen ? (
        <div className="flex items-center gap-1 bg-bgDark1/90 backdrop-blur-xl border border-white/10 p-1 rounded-full shadow-2xl">
          <button 
            onClick={() => setIsInputOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primaryColor text-white text-xs font-bold hover:bg-primaryColor/80 transition-colors"
          >
            <MessageSquare className="size-3.5" />
            Ask AI
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/5 text-secondaryText transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-bgDark1/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl w-64 flex flex-col gap-2">
          <textarea
            autoFocus
            placeholder="Ask AI to rewrite this..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs text-white placeholder:text-secondaryText focus:border-primaryColor outline-none resize-none h-20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (prompt.trim()) onAskAI(prompt)
              }
            }}
          />
          <div className="flex items-center justify-between">
             <span className="text-[10px] text-secondaryText italic ml-1">Selection: "{selectedText.slice(0, 20)}..."</span>
             <button 
               onClick={() => onAskAI(prompt)}
               disabled={!prompt.trim()}
               className="bg-primaryColor text-white px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50"
             >
               Rewrite
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
