import React from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null

  const plans = [
    {
      name: 'Standard',
      price: '₹99',
      period: '1 Month',
      description: 'Simple and easy for your next big presentation.',
      features: [
        'Create up to 20 slides per prompt',
        'Full AI editing power',
        'Standard image generation',
        'Export to PDF & PPTX'
      ],
      buttonText: 'Choose 1 Month',
      popular: false
    },
    {
      name: 'Most Loved',
      price: '₹499',
      period: '6 Months',
      description: 'The perfect choice for regular creators and students.',
      features: [
        'Everything in Standard',
        'Priority AI generation',
        'High-fidelity image models',
        'No watermarks on exports'
      ],
      buttonText: 'Choose 6 Months',
      popular: true
    },
    {
      name: 'Mega Saver',
      price: '₹599',
      period: '8 Months',
      description: 'Our biggest plan for those who want it all.',
      features: [
        'Everything in Most Loved',
        'Longest access duration',
        'Unlimited AI edits',
        'Premium support'
      ],
      buttonText: 'Choose 8 Months',
      popular: false
    }
  ]

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div 
        className="bg-[#0F172A] w-full max-w-5xl rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-300 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-full transition-colors text-secondaryText hover:text-white z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="pt-16 pb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">
            Choose the plan that's right for you
          </h2>
          
          {/* Static Tab (Individual only as requested) */}
          <div className="inline-flex p-1 bg-bgDark2 border border-white/5 rounded-2xl shadow-sm mb-12">
            <div className="px-12 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-bold shadow-lg">
              UPGRADE PLANS
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="px-12 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative bg-bgDark2 border-2 rounded-[32px] p-8 flex flex-col transition-all hover:shadow-2xl hover:-translate-y-1 ${
                plan.popular ? 'border-[#4F46E5] shadow-[#4F46E5]/10' : 'border-white/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-8 bg-gradient-to-r from-[#E933AC] to-[#FF3D77] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                  Most popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-secondaryText leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                </div>
                <div className="text-xs text-secondaryText mt-1 uppercase tracking-widest font-bold">/ {plan.period}</div>
              </div>

              <button 
                className={`w-full py-4 rounded-full font-bold text-sm transition-all mb-8 ${
                  plan.popular 
                    ? 'bg-[#4F46E5] text-white hover:bg-[#4F46E5]/90 shadow-lg shadow-[#4F46E5]/20' 
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {plan.buttonText}
              </button>

              <div className="space-y-4 flex-1">
                <div className="text-[10px] font-bold text-secondaryText uppercase tracking-widest">
                  {plan.name === 'Plus' ? 'Everything in Free, and:' : plan.name === 'Pro' ? 'Everything in Plus, and:' : 'Everything in Pro, and:'}
                </div>
                <ul className="space-y-3">
                  {plan.features.filter(f => !f.startsWith('Everything in')).map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-white/70 leading-tight">
                      <Check className="h-4 w-4 text-[#22C55E] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pb-12 text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
            <div className="h-10 w-10 bg-[#4F46E5]/20 rounded-full flex items-center justify-center text-[#4F46E5] font-bold text-xs border border-[#4F46E5]/30">
              AICPA
            </div>
            <p className="text-xs text-secondaryText text-left">
              We're a <span className="font-bold text-white">SOC 2 Type II</span> compliant organization.<br />
              Learn more at our <a href="#" className="text-[#4F46E5] font-bold hover:underline">Trust Center</a>
            </p>
          </div>
          <p className="text-xs text-secondaryText">
            Learn more about our paid plans
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
