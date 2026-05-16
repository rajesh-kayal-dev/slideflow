import { useState } from 'react'
import { Sparkles, Send, Wand2, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { handleChatAction } from '#/features/presentations/actions/ai-edit-actions'
import { toast } from 'sonner'

const SUGGESTION_CHIPS = [
  'Shorten this slide',
  'Make it more visual',
  'Professional tone',
  'Add key statistics',
  'Regenerate slide',
  'Simplify language',
]

type Message = {
  role: 'user' | 'assistant'
  text: string
}

export function AIChatPanel({ 
  slideId, 
  presentationId, 
  slides = [],
  onEditingSlideIdChange 
}: { 
  slideId?: string, 
  presentationId: string,
  slides?: any[],
  onEditingSlideIdChange?: (id: string | null) => void
}) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const queryClient = useQueryClient()

  const chatActionMut = useMutation({
    mutationFn: (prompt: string) => {
      onEditingSlideIdChange?.(slideId || 'ai-global') // Fallback for global actions
      return handleChatAction({ 
        data: { 
          presentationId, 
          prompt, 
          currentSlideId: slideId,
          slides: slides.map(s => ({ id: s.id, title: s.title, order: s.order }))
        } 
      })
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['presentations', 'detail', presentationId] })
      
      let responseText = data?.message || 'I have updated the presentation based on your request!'
      if (data?.id) {
         // If a new slide was created or targeted, we could highlight it
         onEditingSlideIdChange?.(data.id)
         setTimeout(() => onEditingSlideIdChange?.(null), 2000)
      } else {
         onEditingSlideIdChange?.(null)
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: responseText },
      ])
    },
    onError: (err: any) => {
      onEditingSlideIdChange?.(null)
      toast.error(err.message || 'Action failed')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an error while trying to process that action.' },
      ])
    }
  })

  const handleSend = (textOverride?: string) => {
    const text = textOverride || input.trim()
    if (!text) return
    
    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    chatActionMut.mutate(text)
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-mainBorderDarker bg-bgDark1/40">
      {/* Header */}
      <div className="flex h-11 items-center gap-2 px-4 border-b border-mainBorderDarker">
        <Sparkles className="h-4 w-4 text-primaryColor" />
        <span className="text-xs font-bold text-primaryText uppercase tracking-wider">
          AI Assistant
        </span>
        <span className="ml-auto badge-primary text-[10px]">Beta</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center px-2">
            <div className="h-12 w-12 rounded-2xl bg-primaryColor/10 border border-primaryColor/20 flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-primaryColor" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primaryText mb-1">
                AI Slide Editor
              </p>
              <p className="text-xs text-secondaryText leading-relaxed">
                Ask me to modify any slide. Try the suggestions below to get started.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-6 w-6 shrink-0 rounded-full bg-primaryColor/20 border border-primaryColor/30 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-primaryColor" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primaryColor/20 text-primaryText border border-primaryColor/30'
                    : 'bg-bgDark3 text-secondaryText border border-mainBorderDarker'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        
        {chatActionMut.isPending && (
          <div className="flex gap-2 justify-start animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="h-6 w-6 shrink-0 rounded-full bg-primaryColor/20 border border-primaryColor/30 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primaryColor animate-pulse" />
            </div>
            <div className="max-w-[85%] rounded-xl px-3 py-2 text-xs bg-bgDark3 text-secondaryText border border-mainBorderDarker flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-primaryColor" />
              <span className="italic">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      <div className="px-3 pb-2 border-t border-mainBorderDarker pt-3">
        <p className="text-[10px] text-secondaryText uppercase font-bold tracking-wider mb-2">
          Suggestions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              disabled={chatActionMut.isPending}
              onClick={() => handleSend(chip)}
              className="text-[10px] px-2 py-1 rounded-md bg-bgDark2 border border-mainBorderDarker text-secondaryText hover:text-primaryText hover:border-primaryColor/40 transition-colors disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-mainBorderDarker">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI to edit this slide…"
            className="flex-1 h-9 rounded-lg border border-mainBorderSubtler bg-bgDark2 px-3 text-xs text-primaryText placeholder:text-secondaryText focus:border-primaryColor focus:outline-none transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || chatActionMut.isPending}
            className="h-9 w-9 shrink-0 rounded-lg bg-primaryColor flex items-center justify-center text-white hover:bg-[#7274f3] transition-colors disabled:opacity-40"
          >
            {chatActionMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  )
}
