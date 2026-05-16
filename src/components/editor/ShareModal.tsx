import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, Mail, Link as LinkIcon, Check, Copy, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { sharePresentationAction } from '#/features/presentations/actions/share-actions'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  presentationTitle: string
  presentationId: string
}

export function ShareModal({ isOpen, onClose, presentationTitle, presentationId }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  if (!isOpen) return null

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsSending(true)
    try {
      await sharePresentationAction({
        data: {
          presentationId,
          email,
          baseUrl: window.location.origin
        }
      })
      
      toast.success('Presentation shared successfully!', {
        description: `We've sent a link to ${email}`
      })
      
      setEmail('')
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Failed to share presentation. Please check your SMTP settings.')
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/viewer/${presentationId}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setIsCopied(false), 2000)
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-[#0F172A] w-full max-w-md rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-secondaryText hover:text-white z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 relative">
          <div className="mb-8">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Share2 className="h-6 w-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Share Presentation
            </h2>
            <p className="text-sm text-secondaryText leading-relaxed">
              Invite others to view or collaborate on <span className="text-white font-medium">"{presentationTitle}"</span>
            </p>
          </div>

          <form onSubmit={handleSend} className="space-y-4 mb-8">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-black text-secondaryText uppercase tracking-widest ml-1">
                Recipient Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSending || !email}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all group"
            >
              {isSending ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  Send Invite
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-secondaryText uppercase tracking-widest mb-2 ml-1">
                  Public Link
                </p>
                <div className="h-10 px-3 bg-black/40 border border-white/5 rounded-xl flex items-center text-[11px] text-white/40 truncate font-mono">
                  {window.location.origin}/viewer/{presentationId}
                </div>
              </div>
              <button
                onClick={handleCopyLink}
                className={`mt-6 h-10 px-4 rounded-xl font-bold text-[11px] flex items-center gap-2 transition-all ${
                  isCopied 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
