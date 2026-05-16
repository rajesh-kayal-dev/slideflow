import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatWithBranding } from '#/lib/utils';

const faqs = [
  {
    question: 'How does SlideFlow work?',
    answer: 'Simply enter a text prompt describing your topic, or paste a URL to an article. Our AI analyzes the content, structures an outline, and generates beautifully designed slides with relevant text and formatting.'
  },
  {
    question: 'Can I generate from a URL?',
    answer: 'Yes! You can paste any publicly accessible URL. Our AI will extract the key information and summarize it into a professional presentation.'
  },
  {
    question: 'Can I edit slides after generation?',
    answer: 'Absolutely. You can use our built-in editor to manually tweak text and layouts, or use our AI chat interface to ask for specific changes like "make this slide shorter" or "change the tone to be more professional".'
  },
  {
    question: 'Can I export to PowerPoint?',
    answer: 'Yes, all presentations can be instantly downloaded as a native .pptx file, fully compatible with Microsoft PowerPoint, Google Slides, and Apple Keynote.'
  },
  {
    question: 'Is this good for beginners?',
    answer: 'SlideFlow is designed to be incredibly intuitive. You do not need any design skills or prior experience with presentation software. If you can type a sentence, you can create a premium presentation.'
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-bgDark1 py-24 sm:py-32" id="faq">
      <div className="mx-auto w-11/12 xl:w-10/12">
        <div className="mx-auto max-w-2xl text-center fade-in">
          <span className="block-subtitle">FAQ</span>
          <h2 className="block-big-title mt-4">Frequently asked questions</h2>
          <p className="mt-6 text-secondaryText text-lg">
            Got questions? We have answers. If you can't find what you're looking for, feel free to reach out to our team.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl space-y-4 fade-in">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="card main-border-gray-darker overflow-hidden transition-all duration-300"
            >
              <button
                className="flex w-full cursor-pointer items-center justify-between p-6 text-left"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="content-title text-base sm:text-lg">{formatWithBranding(faq.question, true)}</span>
                <ChevronDown
                  className={`h-5 w-5 text-secondaryText transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''
                    }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="px-6 pb-6 text-secondaryText text-sm leading-relaxed sm:text-base">
                  {formatWithBranding(faq.answer)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
