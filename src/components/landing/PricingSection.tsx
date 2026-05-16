import { Check } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const plans = [
  {
    name: 'Standard',
    price: '₹99',
    period: '/ Month',
    description: 'Simple and easy for your next big presentation.',
    features: [
      'Create up to 20 slides per prompt',
      'Full AI editing power',
      'Standard image generation',
      'Export to PDF & PPTX'
    ],
    buttonText: 'Get Started',
    popular: false
  },
  {
    name: 'Most Loved',
    price: '₹499',
    period: '/ 6 Months',
    description: 'The perfect choice for regular creators and students.',
    features: [
      'Everything in Standard',
      'Priority AI generation',
      'High-fidelity image models',
      'No watermarks on exports'
    ],
    buttonText: 'Start Now',
    popular: true
  },
  {
    name: 'Mega Saver',
    price: '₹599',
    period: '/ 8 Months',
    description: 'Our biggest plan for those who want it all.',
    features: [
      'Everything in Most Loved',
      'Longest access duration',
      'Unlimited AI edits',
      'Premium support'
    ],
    buttonText: 'Get Maximum Access',
    popular: false
  }
];

export function PricingSection({ onOpenAuth }: { onOpenAuth?: (mode?: 'login' | 'signup') => void }) {
  return (
    <section className="bg-bgDark2 py-24 sm:py-32" id="pricing">
      <div className="mx-auto w-11/12 xl:w-10/12">
        <div className="mx-auto max-w-2xl text-center fade-in">
          <span className="block-subtitle">Pricing</span>
          <h2 className="block-big-title mt-4">Simple, transparent pricing</h2>
          <p className="mt-6 text-secondaryText text-lg">
            Choose the plan that best fits your presentation needs. No hidden fees.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`card fade-in relative flex flex-col p-8 ${plan.popular
                ? 'border-primaryColor/50 bg-bgDark3 shadow-[0_0_40px_rgba(99,102,241,0.1)] scale-105 z-10'
                : 'border-mainBorderFaintest'
                }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="badge-primary font-bold uppercase tracking-wider text-[10px]">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="content-title mb-2 text-xl">{plan.name}</h3>
                <p className="content-text-gray text-sm">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primaryText">{plan.price}</span>
                  {plan.period && <span className="text-secondaryText text-sm">{plan.period}</span>}
                </div>
              </div>

              <div className="mb-8 flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primaryColor" />
                      <span className="text-secondaryText text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onOpenAuth?.('signup')}
                className={plan.popular ? 'contained-button h-12 w-full flex items-center justify-center font-bold' : 'outlined-button h-12 w-full font-bold flex items-center justify-center'}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
