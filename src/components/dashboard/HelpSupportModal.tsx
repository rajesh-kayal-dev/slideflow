import React from 'react'
import { X, MessageSquare, BookOpen, Mail, Github, Twitter, ExternalLink, Sparkles, Heart } from 'lucide-react'
import { BrandName } from '#/components/BrandName'

interface HelpSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpSupportModal({ isOpen, onClose }: HelpSupportModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-2xl bg-bgDark1 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primaryColor to-transparent opacity-50" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primaryColor/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primaryColor/10 blur-[80px] rounded-full" />

        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-secondaryText hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 z-10 group"
        >
          <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="p-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="h-16 w-16 bg-primaryColor/10 rounded-2xl flex items-center justify-center mb-6 border border-primaryColor/20 shadow-lg shadow-primaryColor/5">
              <Sparkles className="h-8 w-8 text-primaryColor" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-3">How can we help?</h2>
            <p className="text-secondaryText max-w-md text-sm leading-relaxed">
              We're here to help you create stunning presentations. Choose a way to get in touch or find answers below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Documentation */}
            <a 
              href="#" 
              className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primaryColor/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                Documentation
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-secondaryText leading-relaxed">Learn how to master <BrandName className="text-[10px]" /> with our detailed guides.</p>
            </a>

            {/* Support Community */}
            <a 
              href="#" 
              className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                Community
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-secondaryText leading-relaxed">Join our Discord community and chat with other users.</p>
            </a>

            {/* Email Support */}
            <a 
              href="mailto:rajeshkayal8001@gmail.com" 
              className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Mail className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                Email Support
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-secondaryText leading-relaxed">Need direct help? Drop us a line and we'll get back to you.</p>
            </a>

            {/* Socials */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
              <h3 className="text-white font-bold mb-3 text-sm tracking-tight">Follow us</h3>
              <div className="flex gap-3">
                <a href="https://x.com/RajeshKayal_/followers" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white text-secondaryText transition-all">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://github.com/rajesh-kayal-dev/SlideFlow.git" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white text-secondaryText transition-all">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/in/rajesh110/" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white text-secondaryText transition-all">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-bold text-secondaryText uppercase tracking-widest">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by <BrandName className="text-[10px]" /> Team
          </div>
        </div>
      </div>
    </div>
  )
}
