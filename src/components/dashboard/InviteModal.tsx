import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Mail, Link as LinkIcon, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { inviteMembersAction } from '#/features/workspaces/actions/invite-actions'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceName: string
}

export function InviteModal({ isOpen, onClose, workspaceName }: InviteModalProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'link'>('email')
  const [copied, setCopied] = useState(false)
  const [emails, setEmails] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  
  const inviteLink = `https://SlideFlow.app/workspaces/${workspaceName.toLowerCase().replace(/\s+/g, '-')}/join?code=sf_${Math.random().toString(36).substring(2, 15)}`

  if (!isOpen) return null

  const handleSendInvites = async () => {
    if (!emails.trim()) return
    
    const emailList = emails.split(',').map(e => e.trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    
    if (emailList.length === 0) {
      toast.error('Please enter at least one valid email address')
      return
    }

    setIsInviting(true)
    try {
      await inviteMembersAction({
        data: {
          emails: emailList,
          workspaceName,
          baseUrl: window.location.origin
        }
      })
      
      toast.success(`Invitations sent to ${emailList.length} people!`)
      setEmails('')
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Failed to send invitations. Please check your SMTP settings.')
    } finally {
      setIsInviting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Invite link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="bg-bgDark2 w-full max-w-lg rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-300 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Invite members to {workspaceName}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-secondaryText hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pb-6">
          <div className="flex gap-2 p-1.5 bg-bgDark1 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'email' 
                  ? 'bg-bgDark2 text-white shadow-lg border border-white/10' 
                  : 'text-secondaryText hover:text-white'
              }`}
            >
              <Mail className="h-4 w-4" />
              Invite with email address
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'link' 
                  ? 'bg-bgDark2 text-white shadow-lg border border-white/10' 
                  : 'text-secondaryText hover:text-white'
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              Invite with link
            </button>
          </div>
        </div>

        {/* Content */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            if (activeTab === 'email') handleSendInvites()
          }}
          className="px-8 pb-8 space-y-6"
        >
          {activeTab === 'link' ? (
            <>
              <div className="space-y-4">
                <p className="text-sm text-secondaryText">
                  Anyone can use this link to join your workspace as a member.
                </p>
                <div className="relative group">
                  <input 
                    readOnly
                    value={inviteLink}
                    className="w-full bg-bgDark1/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/50 focus:outline-none transition-all pr-12 truncate"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={handleCopy}
                  className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-[#4F46E5]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    'Copy link'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-full text-secondaryText hover:text-white py-2 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-sm text-secondaryText">
                  Enter the email address of the person you'd like to invite.
                </p>
                <input 
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  disabled={isInviting}
                  className="w-full h-12 bg-bgDark1/50 border border-white/10 rounded-2xl px-5 text-sm text-white focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="space-y-3">
                <button 
                  type="submit"
                  disabled={isInviting || !emails.trim()}
                  className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:opacity-50 text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-[#4F46E5]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send invite'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-full text-secondaryText hover:text-white py-2 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>,
    document.body
  )
}
